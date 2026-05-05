import './assets/main.css'

import { Amplify } from 'aws-amplify';
import { authConfig } from './aws-config';
import '@aws-amplify/ui-vue/styles.css';

Amplify.configure(authConfig);

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
