import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// showAlert prop 추가 (기본값: true)
export default function ProtectedRoute({ children, showAlert = true }) {
  const navigate = useNavigate();
  
  // 로컬 스토리지에서 accessToken 유무를 확인합니다.
  const isAuthenticated = !!localStorage.getItem("accessToken");

  useEffect(() => {
    // 렌더링 직후 로그인이 안 되어 있다면
    if (!isAuthenticated) {
      // showAlert가 true일 때만 알림을 띄웁니다.
      if (showAlert) {
        alert("로그아웃 상태입니다. 로그인 화면으로 이동합니다.");
      }
      navigate("/login", { replace: true }); // replace: true로 설정해 뒤로가기 방지
    }
  }, [isAuthenticated, navigate, showAlert]);

  // 로그인이 안 되어 있다면 화면에 아무것도 그리지 않습니다 (깜빡임 방지).
  if (!isAuthenticated) {
    return null; 
  }

  // 로그인이 되어 있다면 내부 컴포넌트(children)를 정상적으로 보여줍니다.
  return children;
}