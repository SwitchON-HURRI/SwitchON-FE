import { useState } from "react";
import styles from "./SleepTimeModal.module.css";

export default function SleepTimeModal({ onClose, onConfirm }) {
  const [sleepTime, setSleepTime] = useState("22:00");

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <span>오늘 잠들 시간을 입력해주세요</span>

        <input
          type="time"
          value={sleepTime}
          onChange={(e) => setSleepTime(e.target.value)}
        />

        <div className={styles.buttonContainer}>
          <button className={styles.btn1} onClick={onClose}>
            취소
          </button>
          <button
            className={styles.btn2}
            onClick={() => onConfirm(`${sleepTime}:00`)}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
