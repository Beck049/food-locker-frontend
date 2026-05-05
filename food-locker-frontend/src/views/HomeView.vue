<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'

import { useAuthenticator } from '@aws-amplify/ui-vue';
import { toRefs } from 'vue';

// 使用 useAuthenticator 取得全域登入狀態
const auth = useAuthenticator();

// 使用 toRefs 確保 user 具備響應式，當登入狀態改變時畫面會自動更新
const { user, authStatus } = toRefs(auth);
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
