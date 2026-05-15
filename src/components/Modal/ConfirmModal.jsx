import { useState } from "react";
import styles from "./ConfirmModal.module.css";

export default function Modal({ onClose, text }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <span>{text}</span>
        <div className={styles.buttonContainer}>
          <button className={styles.btn1} onClick={onClose}>
            아니요
          </button>
          <button className={styles.btn2} onClick={onClose}>
            예
          </button>
        </div>
      </div>
    </div>
  );
}
