import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { applyAssetCssVariables } from './assets'
import { reportError } from './errors'
import { createAppRouter } from './router'
import './styles/main.scss'

applyAssetCssVariables()

const app = createApp(App)
app.config.errorHandler = (error, _instance, info) => reportError(error, info)

const router = createAppRouter()
// A screen that fails to load (offline, a stale chunk after a new deploy) ends up here too.
router.onError((error) => reportError(error, 'router'))

// Pinia goes first: the router guards read the stores.
app.use(createPinia()).use(router).mount('#app')
