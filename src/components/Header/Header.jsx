import styles from "./Header.module.css";
import notice from "../../assets/icon/notice.svg";
import mypage from "../../assets/icon/mypage.svg";
import setting from "../../assets/icon/setting.svg";
import { useNavigate, NavLink } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  return (
    <div className={styles.header}>
      <div className={styles.topContainer}>
        <span className={styles.date}>{formattedDate}</span>
        <div className={styles.iconContainer}>
          <div className={styles.icon} onClick={() => navigate("/notice")}>
            <img src={notice} alt="notice" />
          </div>
          <div className={styles.icon} onClick={() => navigate("/mypage")}>
            <img src={mypage} alt="mypage" />
          </div>
          <div className={styles.icon} onClick={() => navigate("/setting")}>
            <img src={setting} alt="setting" />
          </div>
        </div>
      </div>
      <div className={styles.navBar}>
        <NavLink
          to="/today"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
          }
        >
          오늘
        </NavLink>
        <NavLink
          to="/weekly"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
          }
        >
          주간
        </NavLink>
        <NavLink
          to="/monthly"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
          }
        >
          월간
        </NavLink>
      </div>
    </div>
  );
}
