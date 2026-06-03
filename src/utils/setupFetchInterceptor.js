// src/utils/setupFetchInterceptor.js

// 1. 브라우저의 원래 fetch 함수 백업
const { fetch: originalFetch } = window;
const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

// 동시 API 호출 시 다중 리프레시 방지를 위한 큐(Queue) 시스템
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
};

// 2. window.fetch 가로채기
window.fetch = async (url, options = {}) => {
  const currentPath = window.location.pathname;

  // ✨ [예외 처리 1] 로그인 관련 페이지 (App.jsx 기준 /login 및 /login/success)
  // LoginSuccess.jsx 에서 수행하는 순수한 초기 로그인 흐름을 방해하지 않도록 예외 처리
  if (currentPath.startsWith("/login")) {
    return originalFetch(url, options);
  }

  // ✨ [예외 처리 2] 외부 API 또는 카카오 인증 등으로 향하는 요청 예외 처리
  if (typeof url === "string" && url.includes("/login/oauth2")) {
    return originalFetch(url, options);
  }

  // 3. 백엔드(BASE_URL)로 향하는 API 요청에 대한 토큰 자동 주입 및 CORS 방어
  if (typeof url === "string" && url.startsWith(BASE_URL)) {
    // MyPage.jsx에서 수동으로 넣던 방식과 완벽히 일치
    const token = localStorage.getItem("accessToken");
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // 백엔드의 302 리다이렉트를 브라우저가 자동 추적하여 CORS 에러를 내는 것을 원천 차단
    options.redirect = "manual";
  }

  // 4. 오리지널 fetch로 백엔드에 요청 전송
  let response = await originalFetch(url, options);

  // 5. 토큰 만료(401) 또는 백엔드의 302 강제 리다이렉트(opaqueredirect) 감지
  if (response.status === 401 || response.type === "opaqueredirect") {
    // 이미 갱신 중이라면 큐에 담고 대기
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          options.headers["Authorization"] = `Bearer ${newToken}`;
          resolve(originalFetch(url, options));
        });
      });
    }

    isRefreshing = true;
    console.log(
      "[Interceptor] 세션 만료 또는 리다이렉트 감지. 토큰 복구 시도...",
    );

    try {
      // LoginSuccess.jsx의 리프레시 로직과 완벽히 동일한 스펙으로 호출
      const refreshRes = await originalFetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
        // 리프레시 자체도 카카오로 튕김 방지
        redirect: "manual",
      });

      // 리프레시 응답 성공 시
      if (refreshRes.ok && refreshRes.type !== "opaqueredirect") {
        const data = await refreshRes.json();

        // 스토리지 키 값 (accessToken, user) 완벽 일치
        localStorage.setItem("accessToken", data.accessToken);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        isRefreshing = false;
        onRefreshed(data.accessToken);

        // 실패했던 원래 요청의 헤더를 새 토큰으로 교체하고 다시 요청
        options.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return originalFetch(url, options);
      } else {
        throw new Error("리프레시 토큰 만료");
      }
    } catch (error) {
      // 복구 실패 시 스토리지 정리 및 로그인 페이지 강제 이동
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

  // 401이나 302가 아니면 정상 응답 반환
  return response;
};
