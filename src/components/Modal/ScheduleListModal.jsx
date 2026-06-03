import { useState, useEffect } from "react";
import styles from "./ScheduleListModal.module.css";
import filter from "../../assets/icon/filter.svg";
import add from "../../assets/icon/add-2.svg";
import ScheduleDetailModal from "./ScheduleDetailModal.jsx";
import AddEditScheduleModal from "./AddEditScheduleModal.jsx";

const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

export default function ScheduleListModal({ date, onClose }) {
  const selectedDate = date ? new Date(date) : new Date();
  const formattedDate = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  const yyyy = selectedDate.getFullYear();
  const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const dd = String(selectedDate.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const [scheduleList, setScheduleList] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchSchedules = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/schedule/read/date?date=${dateStr}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        },
      );
      const data = await res.json();
      setScheduleList(data);
    } catch (err) {
      console.error("일정 조회 실패:", err);
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
      data.forEach((c) => {
        map[c.categoryId] = { color: c.categoryColor, name: c.categoryName };
      });
      setCategoryMap(map);
    } catch (err) {
      console.error("카테고리 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchCategories();
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topContainer}>
          <span className={styles.date}>{formattedDate}</span>
          <div className={styles.iconContainer}>
            <div className={styles.icon}>
              <img src={filter} alt="filter" />
            </div>
            <div
              className={styles.icon}
              onClick={() => setIsAddModalOpen(true)}
            >
              <img src={add} alt="add" />
            </div>
          </div>
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
                  backgroundColor: categoryMap[schedule.categoryId]?.color,
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
            color: categoryMap[selectedSchedule.categoryId]?.color,
            name: categoryMap[selectedSchedule.categoryId]?.name,
          }}
          importance={selectedSchedule.importance}
          date={selectedSchedule.scheduleDate}
          time={
            selectedSchedule.startTime && selectedSchedule.endTime
              ? `${selectedSchedule.startTime.slice(0, 5)}-${selectedSchedule.endTime.slice(0, 5)}`
              : null
          }
          location={selectedSchedule.location}
          memo={selectedSchedule.memo}
          onEdit={() => setSelectedSchedule(null)}
          onClose={() => setSelectedSchedule(null)}
          onDelete={() => {
            fetchSchedules();
            setSelectedSchedule(null);
          }}
        />
      )}

      {isAddModalOpen && (
        <AddEditScheduleModal
          onClose={() => {
            setIsAddModalOpen(false);
            fetchSchedules();
          }}
        />
      )}
    </div>
  );
}
