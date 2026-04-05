import styles from "./Login.module.css";
import powerIcon from "../assets/icon/Power.svg";
import kakaoBtnImg from "../assets/icon/kakaologin.png";

export default function Login() {
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
        <button className={styles.loginButton} type="button"><img src={kakaoBtnImg} alt="카카오톡으로 로그인"/></button>
      </div>
    </>
  );
}
