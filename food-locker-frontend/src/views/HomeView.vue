<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'

import { useAuthenticator } from '@aws-amplify/ui-vue';
import { computed, onMounted, ref, toRefs, watch } from 'vue';

interface Locker {
  location: string;
  number: number;
  Date: string;
  unlocked?: boolean;
}

// 使用 useAuthenticator 取得全域登入狀態
const auth = useAuthenticator();

// 使用 toRefs 確保 user 具備響應式，當登入狀態改變時畫面會自動更新
const { user } = toRefs(auth);
const authStatus = computed(() => auth.authStatus);

const lockers = ref<Locker[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const modalVisible = ref(false);
const modalMessage = ref('');
const modalIsLoading = ref(false);
const apiStage = import.meta.env.VITE_API_STAGE ?? 'front-dev';
const apiUrl = `https://yiqe9ak6xi.execute-api.ap-northeast-1.amazonaws.com/${apiStage}/lockers`;

async function fetchLockers() {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(apiUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`API 回傳錯誤：${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { lockers: Locker[] };
    lockers.value = (data.lockers ?? []).map((locker) => ({ ...locker, unlocked: false }));
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    isLoading.value = false;
  }
}

async function unlockLocker(locker: Locker) {
  modalVisible.value = true;
  modalIsLoading.value = true;
  modalMessage.value = '開啟中，請稍候...';

  try {
    const unlockUrl = `${apiUrl}/${encodeURIComponent(locker.location)}/${locker.number}/unlock`;
    const response = await fetch(unlockUrl, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`API 回傳錯誤：${response.status} ${response.statusText}`);
    }

    locker.unlocked = true;
    modalMessage.value = '開啟成功';
  } catch (err) {
    modalMessage.value = '出現錯誤';
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    modalIsLoading.value = false;
  }
}

onMounted(() => {
  if (authStatus.value === 'authenticated') {
    fetchLockers();
  }
});

watch(authStatus, (newStatus) => {
  if (newStatus === 'authenticated') {
    fetchLockers();
  }
});
</script>

<template>
  <main>
    <div class="about">
        <!-- 情況 A：正在確認身份中 (Loading) -->
        <h1 v-if="authStatus === 'configuring'">確認身份中...</h1>

        <!-- 情況 B：已登入 -->
        <div v-else-if="authStatus === 'authenticated'">
          <h1>這是會員專屬的 Home 頁面</h1>
          <p>歡迎回來，{{ user.signInDetails?.loginId }}！</p>
          <button @click="auth.signOut">登出</button>

          <section class="lockers-data">
            <h2>儲物櫃資料</h2>
            <p class="hint">API: {{ apiUrl }}</p>

            <p v-if="isLoading">載入中，請稍候...</p>
            <p v-if="error" class="error">讀取失敗：{{ error }}</p>

            <table v-if="!isLoading && lockers.length">
              <thead>
                <tr>
                  <th>地點</th>
                  <th>編號</th>
                  <th>操作</th>
                  <th>日期</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(locker, index) in lockers" :key="index">
                  <td>{{ locker.location }}</td>
                  <td>{{ locker.number }}</td>
                  <td>
                    <button
                      class="unlock-btn"
                      :disabled="locker.unlocked || modalIsLoading"
                      @click="unlockLocker(locker)"
                    >
                      {{ locker.unlocked ? '已開啟' : '開啟' }}
                    </button>
                  </td>
                  <td>{{ new Date(locker.Date).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>

            <div v-if="modalVisible" class="modal-overlay">
              <div class="modal-card">
                <p>{{ modalMessage }}</p>
                <button
                  class="modal-close"
                  v-if="!modalIsLoading"
                  @click="modalVisible = false"
                >
                  確認
                </button>
              </div>
            </div>

            <p v-else-if="!isLoading && !error">目前沒有可顯示的儲物櫃資料。</p>
          </section>
        </div>

        <!-- 情況 C：未登入 -->
        <div v-else>
          <h1>你尚未登入</h1>
          <p>登入後即可查看更多詳細資訊。</p>
          <!-- 如果你想在這裡放個按鈕導向登入頁 -->
          <router-link to="/login">前往登入</router-link>
        </div>
      </div>
    <TheWelcome />
  </main>
</template>

<style scoped>
.unlock-btn {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #fff;
  padding: 0.55rem 0.95rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.unlock-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.unlock-btn:disabled {
  background: #94a3b8;
  border-color: #94a3b8;
  cursor: not-allowed;
}

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

.modal-close {
  border: 0;
  background: #2563eb;
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  cursor: pointer;
}
</style>
