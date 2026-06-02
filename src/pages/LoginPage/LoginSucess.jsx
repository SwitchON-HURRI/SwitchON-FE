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

        // 1. HTTP 상태 코드에 따른 에러 분류
        if (!response.ok) {
          let errorCode = 8; // 기본값: 알 수 없는 HTTP 오류
          
          if (response.status === 401) {
            console.error("[LoginSuccess Error] 401: 브라우저가 쿠키를 유실했거나 만료되었습니다.");
            errorCode = 2; // 쿠키 유실 의심
          } else if (response.status === 403) {
            console.error("[LoginSuccess Error] 403: 권한 거부.");
            errorCode = 3;
          } else if (response.status === 404) {
            console.error("[LoginSuccess Error] 404: 잘못된 API 주소.");
            errorCode = 4;
          } else if (response.status >= 500) {
            console.error("[LoginSuccess Error] 5xx: 백엔드 서버 내부 에러.");
            errorCode = 5;
          }

          // 커스텀 에러 객체를 던져 catch 블록에서 처리하게 함
          throw { message: `HTTP 상태 코드 에러: ${response.status}`, code: errorCode };
        }

        // 2. JSON 파싱 검증
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("[LoginSuccess Error] JSON 파싱 실패:", parseError);
          throw { message: "JSON 파싱 에러", code: 6 };
        }

        const { accessToken, user } = data;

        // 3. 필수 데이터 누락 검증
        if (!accessToken || !user) {
          console.error("[LoginSuccess Error] 데이터 누락:", data);
          throw { message: "필수 데이터 누락", code: 7 };
        }

        console.log("[LoginSuccess] 토큰 및 유저 데이터 추출 성공!", { user });

        // 로컬 스토리지 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        console.log("[LoginSuccess] 로컬 스토리지 저장 완료. 메인 페이지로 이동합니다.");
        navigate("/", { replace: true });

      } catch (error) {
        console.error("[LoginSuccess Exception] 에러 포착:", error);

        // throw로 던진 커스텀 에러 객체(code가 존재함)인지, 
        // fetch 자체가 실패한 네트워크/CORS 에러(Native Error)인지 판별
        const finalErrorCode = error.code ? error.code : 1; 

        // 유저에게 에러 코드를 포함하여 알림창 노출
        alert(`로그인에 실패했습니다. 다시 시도해주세요.\n(error code : ${finalErrorCode})`);
        
        navigate("/login", { replace: true });
      }
    };

    // 솔루션 적용: 브라우저가 리다이렉트 직후 쿠키를 디스크/메모리에 
    // 완전히 기록할 미세한 시간을 벌어주기 위한 Race Condition 방어 로직 (500ms 지연)
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