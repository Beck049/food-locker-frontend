<script setup lang="ts">
import LockerGrid from '../components/LockerGrid.vue';
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
const locations = ['test', 'demo'];
const apiStage = import.meta.env.VITE_API_STAGE ?? 'front-dev';
const apiUrl = `https://yiqe9ak6xi.execute-api.ap-northeast-1.amazonaws.com/${apiStage}/lockers`;

async function fetchLockersByLocation(location: string) {
  gridLoading.value = true;
  error.value = null;
  try {
    const locationUrl = `${apiUrl}/${encodeURIComponent(location)}`;
    const response = await fetch(locationUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`API 回傳錯誤：${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { Grid: GridRow[] };
    gridData.value = data.Grid ?? [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    gridLoading.value = false;
  }
}

async function unlockLocker(locker: Locker) {
  try {
    const unlockUrl = `${apiUrl}/${selectedLocation.value}/${locker.id}/unlock`;
    const response = await fetch(unlockUrl, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`API 回傳錯誤：${response.status} ${response.statusText}`);
    }

    locker.status = 'Occupy';
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
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
        @unlock="unlockLocker"
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
</style>
