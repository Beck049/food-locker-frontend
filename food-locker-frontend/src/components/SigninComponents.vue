<script setup>
import { Authenticator } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css'; // 確保樣式有引入

// 自定義表單欄位（選填）：可以讓 UI 更貼合你的需求
const formFields = {
  signIn: {
    username: {
      placeholder: '請輸入您的 Email',
      isRequired: true,
      label: 'Email'
    },
  },
  signUp: {
    email: {
      order: 1,
      isRequired: true,
      label: 'Email'
    },
    password: {
      order: 2,
      isRequired: true,
      label: '密碼'
    },
    confirm_password: {
      order: 3,
      label: '確認密碼'
    }
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <!-- 
      initial-state="signIn": 直接顯示登入頁面而非註冊頁
      form-fields: 使用上面定義的中文標籤
    -->
    <authenticator initial-state="signIn" :form-fields="formFields">
      <template v-slot="{ user, signOut }">
        <div class="welcome-container">
          <h1>歡迎，{{ user.signInDetails?.loginId || '使用者' }}！</h1>
          <div class="user-card">
            <p><strong>狀態：</strong> 已通過 Cognito 驗證</p>
            <p><strong>帳號：</strong> {{ user.username }}</p>
          </div>
          <button @click="signOut" class="signout-btn">登出系統</button>
        </div>
      </template>
    </authenticator>
  </div>
</template>

<style scoped>
.auth-wrapper {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.welcome-container {
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.user-card {
  margin: 1.5rem 0;
  padding: 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: left;
}

.signout-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.signout-btn:hover {
  background-color: #ff7875;
}
</style>