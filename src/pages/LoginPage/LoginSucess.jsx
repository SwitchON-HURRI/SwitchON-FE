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
          let backendErrorMsg = "";

          // 🚨 [추가된 로직] 백엔드에서 보내준 에러 상세 사유(body) 파싱
          try {
            const errorData = await response.json();
            // JSON 형태일 경우 message나 error 필드 추출, 구조를 모를 경우 통째로 문자열화
            backendErrorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (e) {
            // JSON이 아니라 순수 텍스트(String)로 내려올 경우를 대비한 폴백
            try {
              backendErrorMsg = await response.text();
            } catch (e2) {
              backendErrorMsg = "응답 바디를 읽을 수 없음";
            }
          }

          if (response.status === 400) {
            errorCode = 9;
          } else if (response.status === 401) {
            // 콘솔에도 백엔드 메시지 출력
            console.error(`[LoginSuccess Error] 401: ${backendErrorMsg}`);
            errorCode = 2; // 쿠키 유실 의심
          } else if (response.status === 403) {
            errorCode = 3;
          } else if (response.status === 404) {
            errorCode = 4;
          } else if (response.status === 409) {
            errorCode = 10;
          } else if (response.status >= 500) {
            errorCode = 5;
          }

          // 에러 메시지와 상태 코드, 백엔드 상세 사유를 함께 던짐
          throw { 
            message: `HTTP ${response.status}`, 
            code: errorCode, 
            status: response.status, 
            backendMsg: backendErrorMsg 
          };
        }

        // 2. 정상 응답일 경우 JSON 파싱
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

        const finalErrorCode = error.code ? error.code : 1; 
        
        // 🚨 [추가된 로직] 유저 캡처용 팝업 메시지 조립
        let alertMsg = `로그인에 실패했습니다. 다시 시도해주세요.\n(Code : ${finalErrorCode})`;
        
        // 커스텀 에러로 던져진 백엔드 메시지가 있다면 추가
        if (error.backendMsg) {
          alertMsg += `\nStatus: ${error.status}\nReason: ${error.backendMsg}`;
        } else if (finalErrorCode === 1) {
          // 에러 코드가 1(Native 에러)인 경우 CORS나 네트워크 단절로 표기
          alertMsg += `\nReason: CORS 설정 또는 네트워크 에러`;
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