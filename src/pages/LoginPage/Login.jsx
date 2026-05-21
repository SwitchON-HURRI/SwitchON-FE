import styles from "./Login.module.css";
import powerIcon from "../../assets/icon/Power.svg";
import kakaoBtnImg from "../../assets/icon/kakaologin.png";

export default function Login() {
  // 카카오 로그인 버튼 클릭 시 실행될 함수
  const handleKakaoLogin = () => {
    // 환경변수나 상수로 관리 중인 백엔드 베이스 URL을 넣어주세요.
    // 이전 스웨거 스크린샷 기준의 도메인을 예시로 작성했습니다.
    const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
    
    // 가이드 문서 내용대로 백엔드 로그인 엔드포인트로 브라우저를 이동시킵니다.
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