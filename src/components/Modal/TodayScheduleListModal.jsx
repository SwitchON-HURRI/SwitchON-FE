import { useEffect, useState } from "react";
import styles from "./ScheduleListModal.module.css";
import ScheduleDetailModal from "./ScheduleDetailModal.jsx";

export default function TodayScheduleListModal({ date, onClose, onAdded }) {
  const [scheduleList, setScheduleList] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const selectedDate = date ? new Date(date) : new Date();
  const formattedDate = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

  useEffect(() => {
    fetchSchedules();
  }, []);

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

      console.log("date schedules:", data);

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
              onClick={() => setSelectedSchedule(schedule)}
            >
              <span className={styles.scheduleText}>{schedule.title}</span>

              <div
                className={styles.categoryDot}
                style={{
                  backgroundColor: schedule.category?.color,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedSchedule && (
        <ScheduleDetailModal
          scheduleId={selectedSchedule.scheduleId}
          isFixed={selectedSchedule.scheduleType === "FIXED"}
          title={selectedSchedule.title}
          category={{
            color: selectedSchedule.categoryColor,
            name: selectedSchedule.categoryName,
          }}
          importance={selectedSchedule.importance}
          date={selectedSchedule.scheduleDate}
          time={selectedSchedule.startTime}
          location={selectedSchedule.location}
          memo={selectedSchedule.memo}
          onEdit={() => setSelectedSchedule(null)}
          onClose={() => setSelectedSchedule(null)}
          onAdded={() => {
            fetchSchedules();
            onAdded?.();
            setSelectedSchedule(null);
          }}
        />
      )}
    </div>
  );
}
