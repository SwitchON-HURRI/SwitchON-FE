import { useState } from "react";
import styles from "./ScheduleListModal.module.css";
import filter from "../../assets/icon/filter.svg";
import add from "../../assets/icon/add-2.svg";
import ScheduleDetailModal from "./ScheduleDetailModal.jsx";

export default function Modal({ date, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [eventData, setEventData] = useState([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  const dummySchedule = {
    isFixed: false,
    title: "오픽 공부하기",
    category: { color: "#F4ECC8", name: "공부" },
    importance: 3,
    date: formattedDate,
    time: null,
    location: "집",
    des: "집에서 공부하기",
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topContainer}>
          <span className={styles.date}>{formattedDate}</span>
          <div className={styles.iconContainer}>
            <div className={styles.icon}>
              <img src={filter} alt="filter" />
            </div>
            <div className={styles.icon}>
              <img src={add} alt="add" />
            </div>
          </div>
        </div>
        <div className={styles.scheduleList}>
          <div className={styles.scheduleItem} onClick={() => setIsDetailOpen(true)}>
            <span className={styles.scheduleText}>오픽 공부하기</span>
            <div
              className={styles.categoryDot}
              style={{ backgroundColor: "#F4ECC8" }}
            ></div>
          </div>
          <div className={styles.scheduleItem}>
            <span className={styles.scheduleText}>유튜브 편집하기</span>
            <div
              className={styles.categoryDot}
              style={{ backgroundColor: "#CFD6C6" }}
            ></div>
          </div>
          <div className={styles.scheduleItem}>
            <span className={styles.scheduleText}>알바(고정)</span>
            <div
              className={styles.categoryDot}
              style={{ backgroundColor: "#EEDBDF" }}
            ></div>
          </div>
        </div>
      </div>
      {isDetailOpen && (
        <ScheduleDetailModal
          {...dummySchedule}
          onEdit={() => setIsDetailOpen(false)}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  );
}
