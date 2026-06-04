// src/utils/setupFetchInterceptor.js

const { fetch: originalFetch } = window;
const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

// 동시 API 호출 시 다중 리프레시 방지를 위한 큐(Queue) 시스템
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
};

window.fetch = async (url, options = {}) => {
  const currentPath = window.location.pathname;

  // [예외 처리 1] 로그인 페이지 (App.jsx 기준 /login 및 /login/success) 무시
  if (currentPath.startsWith("/login")) {
    return originalFetch(url, options);
  }

  // [예외 처리 2] 외부 API 또는 카카오 인증 요청 무시
  if (typeof url === "string" && url.includes("/login/oauth2")) {
    return originalFetch(url, options);
  }

  // 1. 백엔드로 향하는 API 요청에 기존 Access Token 주입
  if (typeof url === "string" && url.startsWith(BASE_URL)) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    // (이전에 있던 redirect: 'manual' 꼼수는 백엔드가 고쳐주었으므로 삭제됨!)
  }

  // 2. 오리지널 fetch로 백엔드에 요청 전송
  let response = await originalFetch(url, options);

  // 3. 백엔드 요구사항: "Access Token 만료 시 401 반환을 프론트가 캐치"
  if (response.status === 401) {
    // 이미 다른 API가 리프레시 중이라면 큐(대기열)에 넣고 대기
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          options.headers["Authorization"] = `Bearer ${newToken}`;
          resolve(originalFetch(url, options));
        });
      });
    }

    isRefreshing = true;
    console.log("[Interceptor] 401 Unauthorized 감지. /auth/refresh 호출...");

    try {
      // 4. 백엔드 요구사항: "401 발생 시 /auth/refresh 호출"
      const refreshRes = await originalFetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });

      // 리프레시 성공 시
      if (refreshRes.ok) {
        const data = await refreshRes.json();

        // 새 Access Token 저장
        localStorage.setItem("accessToken", data.accessToken);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        isRefreshing = false;
        onRefreshed(data.accessToken);

        console.log(
          "[Interceptor] 토큰 재발급 성공! 기존 실패 요청을 재시도합니다.",
        );

        // 5. 백엔드 요구사항: "새 Access Token으로 기존 요청 재시도"
        options.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return originalFetch(url, options);
      } else {
        throw new Error("리프레시 토큰 만료 또는 실패");
      }
    } catch (error) {
      // 6. 백엔드 요구사항: "refresh 실패 시 로그인 화면 이동"
      console.error("[Interceptor] 세션 복구 실패. 강제 로그아웃 처리합니다.");
      isRefreshing = false;
      refreshSubscribers = [];

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
      return response;
    }
  }

  // 401이 아니면(200 OK 또는 400 등) 정상 응답 반환
  return response;
};
