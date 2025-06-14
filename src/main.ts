import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import FontAwesomeIcon from './assets/FontAwesome';

const app = createApp(App);

app.component('fa-icon', FontAwesomeIcon);

app.mount('#app').$nextTick(() => {
    
});