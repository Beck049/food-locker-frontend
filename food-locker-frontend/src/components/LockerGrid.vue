<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { fetchAuthSession } from 'aws-amplify/auth';

interface Locker {
  id: string | number;
  status: string;
}

type GridRow = Locker[];

const props = defineProps<{
  grid: GridRow[];
  location: string;
}>();

const modalVisible = ref(false);
const modalMessage = ref('');
const modalIsLoading = ref(false);
const isConfirming = ref(false);
const targetLocker = ref<Locker | null>(null);
const remainingTime = ref(300);
let countdownTimer: number | null = null;
let arn = '';

const apiStage = import.meta.env.VITE_API_STAGE ?? 'front-dev';
const apiUrl = `https://yiqe9ak6xi.execute-api.ap-northeast-1.amazonaws.com/${apiStage}/lockers`;

function startCountdown() {
  remainingTime.value = 300;
  if (countdownTimer) clearInterval(countdownTimer);
  
  countdownTimer = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      closeModal(); // 倒數結束自動關閉
    }
  }, 1000);
}

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

onUnmounted(() => {
  clearCountdown();
});

async function openConfirmModal(locker: Locker) {
  targetLocker.value = locker;
  modalVisible.value = true;
  isConfirming.value = false;
  modalIsLoading.value = true;
  modalMessage.value = '正在取得預訂資訊，請稍候...';

  try {
    const startBookingUrl = `${apiUrl}/${props.location}/${parseInt(String(locker.id))}/start-booking`;
    const headers = await getAuthHeaders();
    const response = await fetch(startBookingUrl, { method: 'POST', headers });
    if (!response.ok) {
      throw new Error(`API 回傳錯誤：${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
        success: boolean;
        message: string;
        data: {
            executionArn: string;
            status: string;
        }
    };
    arn = data.data.executionArn;
    console.log('Received ARN:', arn);

    if (data.success) {
      isConfirming.value = true;
      modalMessage.value = data.message || `確定要預訂該櫃子 (${locker.id}) 嗎？`;
      startCountdown();
    } else {
      modalMessage.value = data.message || '取得預訂資訊失敗，請稍後重試';
    }
  } catch (err) {
    modalMessage.value = err instanceof Error ? err.message : String(err);
  } finally {
    modalIsLoading.value = false;
  }
}

/**
 * 取得最新的 ID Token 並包裝成 Header
 */
async function getAuthHeaders() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
}

async function executeBooking() {
  if (!targetLocker.value) return;
  const locker = targetLocker.value;

  isConfirming.value = false;
  clearCountdown();
  modalIsLoading.value = true;
  modalMessage.value = '處理中，請稍候...';

  try {
    const execBookingUrl = `${apiUrl}/${props.location}/${parseInt(String(locker.id))}/exec-booking`;
    const headers = await getAuthHeaders();
    const body = JSON.stringify({ executionArn: arn });
    const response = await fetch(execBookingUrl, { method: 'POST', headers, body });
    if (!response.ok) {
      throw new Error(`API 回傳錯誤：${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      message: string;
      data: {
        final_status: string;
      };
    };

    if (data.success) {
      locker.status = 'Occupy';
      modalMessage.value = data.message || '預訂成功！';
    } else {
      modalMessage.value = data.message || '預訂失敗，請稍後重試';
    }
  } catch (err) {
    modalMessage.value = err instanceof Error ? err.message : String(err);
  } finally {
    modalIsLoading.value = false;
  }
}

function closeModal() {
  clearCountdown();
  modalVisible.value = false;
  targetLocker.value = null;
  isConfirming.value = false;
  window.location.reload();
}

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case 'available':
      return 'available';
    case 'occupied':
      return 'occupy';
    case 'softlocked':
      return 'occupy';
    case 'reserved':
      return 'occupy';
    case 'error':
      return 'error';
    default:
      return '';
  }
}
</script>

<template>
  <div class="locker-container">
    <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="locker-row">
      <button
        v-for="locker in row"
        :key="locker.id"
        class="locker-btn"
        :class="getStatusClass(locker.status)"
        :disabled="locker.status !== 'Available'"
        @click="openConfirmModal(locker)"
      >
        {{ locker.id }}
      </button>
    </div>

    <!-- 彈窗 (Modal) -->
    <div v-if="modalVisible" class="modal-overlay">
      <div class="modal-card">
        <p>{{ modalMessage }}</p>

        <!-- 確認階段 (詢問是否預約) -->
        <div v-if="isConfirming" class="confirm-container">
          <p class="timer-text">剩餘時間：{{ remainingTime }} 秒</p>
          <div class="modal-actions">
            <button class="modal-btn cancel-btn" @click="closeModal">取消</button>
            <button class="modal-btn confirm-btn" @click="executeBooking">確定</button>
          </div>
        </div>

        <!-- API 執行中 / 結果顯示階段 -->
        <div v-else-if="!modalIsLoading" class="modal-actions">
          <button class="modal-btn confirm-btn" @click="closeModal">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.locker-container {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: row;
}

.locker-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f9fafb;
  justify-content: flex-end;
}

.locker-btn {
  border: 2px solid;
  color: #fff;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

/* Available Status - Blue */
.locker-btn.available {
  background: #2563eb;
  border-color: #2563eb;
}

.locker-btn.available:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Occupy Status - Gray */
.locker-btn.occupy {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

/* Error Status - Red */
.locker-btn.error {
  background: #ef4444;
  border-color: #ef4444;
  cursor: not-allowed;
}

.locker-btn:disabled {
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(15, 23, 42, 0.45);
  z-index: 50;
}

.modal-card {
  width: min(90vw, 420px);
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
  text-align: center;
}

.modal-card p {
  margin-bottom: 1rem;
  color: #111827;
  font-size: 1rem;
}

.modal-card p.timer-text {
  margin-bottom: 1.25rem;
  color: #ef4444;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.modal-btn {
  border: 0;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background 0.2s;
}

.confirm-btn {
  background: #2563eb;
  color: #fff;
}
.confirm-btn:hover {
  background: #1d4ed8;
}

.cancel-btn {
  background: #e5e7eb;
  color: #374151;
}
.cancel-btn:hover {
  background: #d1d5db;
}
</style>
