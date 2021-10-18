import { createApp } from 'vue'
import App from './App.vue'

import 'element-plus/dist/index.css'

import {
  ElCard,
  ElAside,
  ElMain,
  ElContainer,
  ElTable,
  ElTableColumn,
  ElRow,
  ElCol,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElPagination,
  ElDialog,
  ElUpload
} from 'element-plus'

const app = createApp(App)

const components = [
  ElCard,
  ElAside,
  ElMain,
  ElContainer,
  ElTable,
  ElTableColumn,
  ElRow,
  ElCol,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElPagination,
  ElDialog,
  ElUpload
]
components.forEach((component) => {
  app.component(component.name, component)
})

app.mount('#app')
