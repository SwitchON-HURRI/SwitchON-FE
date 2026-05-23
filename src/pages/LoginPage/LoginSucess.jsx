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
          // 백엔드 요구사항에 따라 빈 객체를 전달합니다.
          body: JSON.stringify({}), 
          // axios의 withCredentials: true와 동일한 역할 (쿠키 포함)
          credentials: "include", 
        });

        console.log(`[LoginSuccess] 백엔드 응답 수신 - HTTP 상태 코드: ${response.status}`);

        // 분기 1: HTTP 상태 코드가 200~299 사이가 아닌 경우 (에러 발생)
        if (!response.ok) {
          if (response.status === 401) {
            console.error("[LoginSuccess Error] 401 Unauthorized: 쿠키(refresh_token)가 브라우저에 없거나 만료되었습니다.");
          } else if (response.status === 403) {
            console.error("[LoginSuccess Error] 403 Forbidden: 접근 권한이 거부되었습니다.");
          } else if (response.status === 404) {
            console.error("[LoginSuccess Error] 404 Not Found: 백엔드 API 엔드포인트 주소가 잘못되었습니다.");
          } else if (response.status >= 500) {
            console.error("[LoginSuccess Error] 5xx Server Error: 백엔드 서버 내부 에러입니다.");
          } else {
            console.error(`[LoginSuccess Error] 알 수 없는 HTTP 에러: ${response.status}`);
          }
          // catch 블록으로 에러 처리를 넘김
          throw new Error(`HTTP 요청 실패 (상태 코드: ${response.status})`); 
        }

        // 분기 2: 백엔드 응답이 올바른 JSON 형식이 아닌 경우 (예: HTML 에러 페이지가 반환됨)
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("[LoginSuccess Error] JSON 파싱 실패: 백엔드에서 JSON이 아닌 형식(텍스트, HTML 등)을 반환했습니다.", parseError);
          throw new Error("JSON 파싱 에러");
        }

        const { accessToken, user } = data;

        // 분기 3: JSON 응답은 정상이나, 필요한 데이터(Token, User)가 누락된 경우
        if (!accessToken || !user) {
          console.error("[LoginSuccess Error] 데이터 누락: 응답에 accessToken 또는 user 객체가 없습니다.", data);
          throw new Error("필수 데이터 누락");
        }

        console.log("[LoginSuccess] 토큰 및 유저 데이터 추출 성공!", { user });

        // 로컬 스토리지 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        console.log("[LoginSuccess] 로컬 스토리지 저장 완료. 메인 페이지로 이동합니다.");
        navigate("/");

      } catch (error) {
        // 분기 4: 네트워크 단절, CORS 에러, 또는 위에서 throw한 예외들이 모두 여기로 모입니다.
        console.error("[LoginSuccess Exception] 최종 에러 감지 (네트워크 문제, CORS, 또는 HTTP 처리 중단):", error);
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
        navigate("/login", { replace: true });
      }
    };

    fetchToken();
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <h2>로그인 처리 중입니다... 잠시만 기다려주세요 🚀</h2>
    </div>
  );
}