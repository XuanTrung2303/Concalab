import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath} from 'url'
const f=n=>fileURLToPath(new URL(n,import.meta.url))
export default defineConfig({plugins:[vue()],build:{target:'es2020',rollupOptions:{input:{main:f('./index.html'),admin:f('./admin.html')}}}})
