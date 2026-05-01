export const authConfig = {
  Auth: {
    Cognito: {
      // 在 .env 設定檔中，使用 VITE_ 前綴來定義環境變數
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
    }
  }
};