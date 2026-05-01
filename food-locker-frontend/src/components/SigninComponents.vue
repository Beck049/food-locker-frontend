<script setup>
import { Authenticator } from '@aws-amplify/ui-vue';
</script>

<template>
    <!-- Authenticator 元件會自動處理登入、註冊、忘記密碼 -->
    <authenticator>
      <template v-slot="{ user, signOut }">
        <div v-if="user">
          <h1>歡迎，{{ user.signInDetails?.loginId || '使用者' }}！</h1>
          <p>你已成功透過 Cognito 登入。</p>
          <button @click="signOut">登出</button>
        </div>
      </template>
    </authenticator>
</template>