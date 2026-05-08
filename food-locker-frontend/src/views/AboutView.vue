<script setup lang="ts">
import LockerGrid from '../components/LockerGrid.vue';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ref } from 'vue';

interface Locker {
  id: string | number;
  status: string;
}

type GridRow = Locker[];

const selectedLocation = ref<string>('');
const gridData = ref<GridRow[]>([]);
const gridLoading = ref(false);
const error = ref<string | null>(null);
const locations = ['NTHU', 'test', 'demo'];
const apiStage = import.meta.env.VITE_API_STAGE ?? 'front-dev';
const apiUrl = `https://yiqe9ak6xi.execute-api.ap-northeast-1.amazonaws.com/${apiStage}/lockers`;

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

async function fetchLockersByLocation(location: string) {
  gridLoading.value = true;
  error.value = null;
  try {
    const locationUrl = `${apiUrl}/${encodeURIComponent(location)}`;
    const headers = await getAuthHeaders();
    const response = await fetch(locationUrl, { method: 'GET', headers });
    if (!response.ok) {
      throw new Error(`API 回傳錯誤：${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { data: { Grid: GridRow[] } };
    gridData.value = data.data.Grid ?? [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    gridLoading.value = false;
  }
}
</script>

<template>
  <div class="about">
    <h1>儲物櫃管理</h1>

    <section class="location-selector">
      <div class="dropdown-wrapper">
        <label for="location-select">選擇地點：</label>
        <select
          id="location-select"
          v-model="selectedLocation"
          @change="selectedLocation && fetchLockersByLocation(selectedLocation)"
        >
          <option value="">-- 請選擇地點 --</option>
          <option v-for="loc in locations" :key="loc" :value="loc">
            {{ loc }}
          </option>
        </select>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="gridLoading">載入中，請稍候...</p>

      <LockerGrid
        v-if="!gridLoading && !error && gridData.length"
        :grid="gridData"
        :location="selectedLocation"
      />

      <p v-if="selectedLocation && !gridLoading && !gridData.length">
        此地點沒有可顯示的儲物櫃資料。
      </p>
    </section>
  </div>
</template>

<style scoped>
.about {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.about h1 {
  font-size: 2rem;
  color: #111827;
  margin-bottom: 2rem;
}

.location-selector {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
}

.dropdown-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.dropdown-wrapper label {
  font-weight: 500;
  color: #374151;
}

.dropdown-wrapper select {
  padding: 0.65rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #111827;
  cursor: pointer;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.dropdown-wrapper select:hover {
  border-color: #2563eb;
}

.dropdown-wrapper select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.error {
  color: #b91c1c;
  margin: 1rem 0;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .about h1 {
    color: #f3f4f6;
  }
  .location-selector {
    background: #1f2937;
    border-color: #374151;
  }
  .dropdown-wrapper label {
    color: #d1d5db;
  }
  .dropdown-wrapper select {
    background: #374151;
    border-color: #4b5563;
    color: #f3f4f6;
  }
  .dropdown-wrapper select:hover {
    border-color: #60a5fa;
  }
  .dropdown-wrapper select:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }
  .error {
    color: #f87171;
  }
}
</style>
