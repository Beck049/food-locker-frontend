<script setup lang="ts">
import { computed } from 'vue';

interface Locker {
  id: string | number;
  status: string;
}

type GridRow = Locker[];

defineProps<{
  grid: GridRow[];
}>();

defineEmits<{
  unlock: [locker: Locker];
}>();

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case 'available':
      return 'available';
    case 'occupy':
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
        @click="$emit('unlock', locker)"
      >
        {{ locker.id }}
      </button>
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
</style>
