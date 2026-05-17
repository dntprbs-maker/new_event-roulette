import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // SPA 중첩 라우트 및 새로고침 지원을 위해 루트 절대 경로로 명시
  
  // 환경 변수 보안 및 명확한 관리를 위해 설정 명시
  envDir: '.', 
  envPrefix: 'VITE_', // VITE_ 로 시작하는 변수만 클라이언트에 노출되도록 제한
})
