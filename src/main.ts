import { createApp } from 'vue'
import App from './App.vue'
import '@po-ui/style/css/po-theme-default.min.css'
import { poUIPlugin } from '../index';
const app = createApp(App)
app.use(poUIPlugin);
app.mount('#app')
