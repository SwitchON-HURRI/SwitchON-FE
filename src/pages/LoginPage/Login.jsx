import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import powerIcon from "../../assets/icon/Power.svg";
import kakaoBtnImg from "../../assets/icon/kakaologin.png";

export default function Login() {
  const navigate = useNavigate();

  // 이미 로그인된 사용자가 로그인 페이지에 접근할 경우 메인으로 리다이렉트
  useEffect(() => {
    const isAuthenticated = !!localStorage.getItem("accessToken");
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // 카카오 로그인 버튼 클릭 시 실행될 함수
  const handleKakaoLogin = () => {
    const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
    window.location.href = `${BASE_URL}/login/oauth2/kakao`;
  };

  return (
    <>
      <div className={styles.login}>
        <h1 className={styles.title}>
          <span className={styles.loginTitleText}>SWITCH</span>
          <img src={powerIcon} alt="Power Icon" className={styles.powerIcon} />
          <span className={styles.loginTitleText}>N</span>
        </h1>
        <p className={styles.loginSubtitle}>
          소셜 계정으로 간편하게 가입하기
        </p>
        <button 
          className={styles.loginButton} 
          type="button" 
          onClick={handleKakaoLogin}
        >
          <img src={kakaoBtnImg} alt="카카오톡으로 로그인"/>
        </button>
      </div>
    </>
  );
}