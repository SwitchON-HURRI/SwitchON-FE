import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // URL의 쿼리 파라미터를 읽기 위한 훅
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    const exchangeToken = async () => {
      console.log("[LoginSuccess] 토큰 교환 프로세스 시작...");
      
      // 1. URL에서 백엔드가 넘겨준 1회용 code 읽기
      const code = searchParams.get("code");

      if (!code) {
        console.error("[LoginSuccess Error] URL에 code 파라미터가 없습니다.");
        alert("잘못된 접근입니다. 다시 로그인해주세요.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // 2. /auth/exchange로 code 전송
        const response = await fetch(`${BASE_URL}/auth/exchange`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }), // 1회용 코드를 바디에 담아 전송
          credentials: "include", // 교환 완료 후 백엔드가 refresh cookie를 세팅할 수 있도록 유지
        });

        console.log(`[LoginSuccess] 백엔드 응답 수신 - HTTP 상태 코드: ${response.status}`);

        // 3. HTTP 상태 코드 및 백엔드 요구사항에 따른 에러 분류
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

          // 상태 코드 분기 (기존의 상세 에러 로직 유지)
          if (response.status === 401) {
            errorCode = 2;
            displayReason = `401 Unauthorized: 인증 코드가 만료되었거나 유효하지 않습니다. (${backendErrorMsg})`;
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
          throw { code: errorCode, reason: displayReason };
        }

        // 4. 정상 응답일 경우 JSON 파싱
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("[LoginSuccess Error] JSON 파싱 실패:", parseError);
          throw { code: 6, reason: "JSON 파싱 실패" };
        }

        const { accessToken, user } = data;

        // 5. 필수 데이터 누락 검증
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

    // 지연 시간 없이 즉시 실행
    exchangeToken();

  }, [navigate, BASE_URL, searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <h2>로그인 처리 중입니다... 잠시만 기다려주세요 🚀</h2>
    </div>
  );
}