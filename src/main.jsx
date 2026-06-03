import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './utils/setupFetchInterceptor'; //fetch 인터셉터 설정 파일 임포트, 토큰 만료 시 리다이렉트 CORS 이슈 해소

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
