import { useState } from "react";
import Header from "../../components/Header/Header.jsx";
import styles from "./Home.module.css";
import switchBtn from "../../assets/icon/switch.svg";
import SelectedState from "../../components/SelectedState/SelectedState.jsx";

export default function Home() {
  const [selectedState, setSelectedState] = useState(null);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div
          className={styles.selectStateContainer}
          style={{ visibility: selectedState ? "hidden" : "visible" }}
        >
          <button onClick={() => setSelectedState("comfort")}>comfort</button>
          <button onClick={() => setSelectedState("regular")}>regular</button>
          <button onClick={() => setSelectedState("hard")}>hard</button>
        </div>
        <SelectedState selected={selectedState || "선택한 값"} />
        <div className={styles.ringWrapper}>
          <img className={styles.switchBtn} src={switchBtn} alt="스위치 버튼" />
        </div>
        <div className={styles.addScheduleBox}>
          <span>
            +<br />
            일정을 추가하세요
          </span>
        </div>
      </div>
    </>
  );
}
