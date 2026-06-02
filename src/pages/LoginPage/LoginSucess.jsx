import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    const fetchToken = async () => {
      console.log("[LoginSuccess] 토큰 발급 프로세스 시작...");

      try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          credentials: "include", // 쿠키를 포함시켜 보냄
        });

        console.log(`[LoginSuccess] 백엔드 응답 수신 - HTTP 상태 코드: ${response.status}`);

        // 1. HTTP 상태 코드 및 백엔드 요구사항에 따른 에러 분류
        if (!response.ok) {
          let errorCode = 8; 
          let backendErrorMsg = "";
          let displayReason = "알 수 없는 에러";

          // 백엔드 에러 body 파싱
          try {
            const errorData = await response.json();
            backendErrorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (e) {
            try {
              backendErrorMsg = await response.text();
            } catch (e2) {
              backendErrorMsg = "응답 바디를 읽을 수 없음";
            }
          }

          // 상태 코드 분기 및 백엔드가 요청한 에러 텍스트 매핑
          if (response.status === 401) {
            errorCode = 2;
            // 대소문자 구분 없이 비교하기 위해 소문자로 변환하여 체크
            const lowerMsg = backendErrorMsg.toLowerCase();
            
            if (lowerMsg.includes("required")) {
              displayReason = "쿠키가 아예 안 붙은 것 (Refresh token is required)";
            } else if (lowerMsg.includes("recognized")) {
              displayReason = "토큰 회전/기존 쿠키 문제 (Refresh token was not recognized)";
            } else {
              displayReason = `401 기타 에러: ${backendErrorMsg}`;
            }
          } else if (response.status === 400) {
            errorCode = 9;
            displayReason = `400 Bad Request: ${backendErrorMsg}`;
          } else if (response.status === 403) {
            errorCode = 3;
            displayReason = `403 Forbidden: ${backendErrorMsg}`;
          } else if (response.status === 404) {
            errorCode = 4;
            displayReason = "404 API Not Found";
          } else if (response.status === 409) {
            errorCode = 10;
            displayReason = `409 Conflict: ${backendErrorMsg}`;
          } else if (response.status >= 500) {
            errorCode = 5;
            displayReason = "5xx 백엔드 서버 에러";
          }

          // 분기 처리된 내용을 담아 catch 블록으로 던짐
          throw { 
            code: errorCode, 
            reason: displayReason 
          };
        }

        // 2. 정상 응답일 경우 JSON 파싱
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("[LoginSuccess Error] JSON 파싱 실패:", parseError);
          throw { code: 6, reason: "JSON 파싱 실패" };
        }

        const { accessToken, user } = data;

        // 3. 필수 데이터 누락 검증
        if (!accessToken || !user) {
          console.error("[LoginSuccess Error] 데이터 누락:", data);
          throw { code: 7, reason: "필수 데이터 누락 (accessToken 또는 user 없음)" };
        }

        console.log("[LoginSuccess] 토큰 및 유저 데이터 추출 성공!", { user });

        // 로컬 스토리지 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        console.log("[LoginSuccess] 로컬 스토리지 저장 완료. 메인 페이지로 이동합니다.");
        navigate("/", { replace: true });

      } catch (error) {
        console.error("[LoginSuccess Exception] 에러 포착:", error);

        let alertMsg = `로그인에 실패했습니다. 다시 시도해주세요.\n`;
        
        // 커스텀하게 throw한 에러(HTTP 에러 등)인 경우
        if (error.reason) {
          alertMsg += `(Code: ${error.code})\nReason: ${error.reason}`;
        } 
        // fetch 함수 자체가 실패한 경우 (네트워크 단절, CORS 에러 등)
        else {
          alertMsg += `(Code: 1)\nReason: CORS/fetch 자체 실패 (origin, credentials 설정 문제 등)`;
        }

        alert(alertMsg);
        navigate("/login", { replace: true });
      }
    };

    // Race Condition 방어 로직 (500ms 지연)
    setTimeout(() => {
      fetchToken();
    }, 500);

  }, [navigate, BASE_URL]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <h2>로그인 처리 중입니다... 잠시만 기다려주세요 🚀</h2>
    </div>
  );
}