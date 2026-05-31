import { useEffect, useState } from "react";
import styles from "./ScheduleListModal.module.css";

export default function TodayScheduleListModal({ date, onClose, onAdded }) {
  const [scheduleList, setScheduleList] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const selectedDate = date ? new Date(date) : new Date();
  const formattedDate = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  const [categoryMap, setCategoryMap] = useState({});
  const [todayScheduleIds, setTodayScheduleIds] = useState([]);

  useEffect(() => {
    fetchSchedules();
    fetchCategories();
    fetchTodayScheduleIds();
  }, []);

  const fetchTodayScheduleIds = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/today-schedule/today`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const data = await res.json();
      setTodayScheduleIds(data.map((item) => item.scheduleId));
    } catch (err) {
      console.error(err);
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

      // { categoryId: color } 형태로 변환
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
    if (todayScheduleIds.includes(schedule.scheduleId)) {
      alert("이미 오늘 일정에 추가됐거나 완료된 일정입니다.");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");

      const res = await fetch(
        `${BASE_URL}/today-schedule/add/${schedule.scheduleId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
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

  const fetchSchedules = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const selectedDateObj = date ? new Date(date) : new Date();

      const yyyy = selectedDateObj.getFullYear();
      const mm = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDateObj.getDate()).padStart(2, "0");

      const formatted = `${yyyy}-${mm}-${dd}`;

      const res = await fetch(
        `${BASE_URL}/schedule/read/date?date=${formatted}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        },
      );

      const data = await res.json();
      console.log(data);
      setScheduleList(data);
    } catch (err) {
      console.error("일정 조회 실패:", err);
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
