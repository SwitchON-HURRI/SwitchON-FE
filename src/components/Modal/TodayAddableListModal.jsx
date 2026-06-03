import { useEffect, useState } from "react";
import styles from "./TodayAddableListModal.module.css";

export default function TodayAddableListModal({ date, onClose, onAdded }) {
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const [scheduleList, setScheduleList] = useState([]);
  const selectedDate = date ? new Date(date) : new Date();
  const formattedDate = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  const [categoryMap, setCategoryMap] = useState({});

  useEffect(() => {
    fetchAddableSchedules();
    fetchCategories();
  }, []);

  const fetchAddableSchedules = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/schedule/read/today-addable`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const data = await res.json();
      setScheduleList(data);
      console.log("추가 가능한 일정:", data);
    } catch (err) {
      console.error("추가 가능한 일정 조회 실패:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/category/read`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const data = await res.json();
      const map = {};
      data.forEach((cat) => {
        map[cat.categoryId] = cat.categoryColor;
      });
      setCategoryMap(map);
    } catch (err) {
      console.error("카테고리 조회 실패:", err);
    }
  };

  const handleScheduleClick = async (schedule) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/today-schedule/add/${schedule.scheduleId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("오늘 일정 추가 실패");
      onAdded?.();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topContainer}>
          <span className={styles.date}>{formattedDate}</span>
        </div>
        <div className={styles.scheduleList}>
          {scheduleList.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className={styles.scheduleItem}
              onClick={() => handleScheduleClick(schedule)}
            >
              <span className={styles.scheduleText}>{schedule.title}</span>
              <div
                className={styles.categoryDot}
                style={{
                  backgroundColor: categoryMap[schedule.categoryId],
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
