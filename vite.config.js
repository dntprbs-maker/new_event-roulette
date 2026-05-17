import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 배포 시 경로 꼬임 방지를 위해 상대 경로로 변경
  
  // 환경 변수 보안 및 명확한 관리를 위해 설정 명시
  envDir: '.', 
  envPrefix: 'VITE_', // VITE_ 로 시작하는 변수만 클라이언트에 노출되도록 제한
})
