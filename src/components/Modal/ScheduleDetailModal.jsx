import { useState, useEffect } from "react";
import styles from "./ScheduleDetailModal.module.css";
import fixed from "../../assets/icon/fixed.svg";
import locationIcon from "../../assets/icon/location.svg";
import dateIcon from "../../assets/icon/date.svg";
import timeIcon from "../../assets/icon/time.svg";
import addIcon from "../../assets/icon/add-3.svg";
import deleteIcon from "../../assets/icon/fi-rr-trash.svg";
import ConfirmModal from "./ConfirmModal.jsx";
import AddEditScheduleModal from "./AddEditScheduleModal.jsx";

export default function ScheduleDetailModal({
  scheduleId,
  isFixed,
  title,
  category,
  importance,
  date,
  time,
  location,
  memo,
  onEdit,
  onClose,
  onAdded,
  onDelete,
}) {
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [todayScheduleIds, setTodayScheduleIds] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    fetchTodaySchedules();
  }, []);

  const fetchTodaySchedules = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_URL}/today-schedule/today`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      const data = await res.json();
      setTodayScheduleIds(data.map((item) => item.scheduleId));
    } catch (err) {
      console.error(err);
    }
  };

  const getToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  const isToday = (date) => {
    return date?.slice(0, 10) === getToday();
  };

  const handleAddTodaySchedule = async () => {
    if (todayScheduleIds.includes(scheduleId)) {
      alert("이미 오늘 일정에 담겼거나 완료된 일정입니다.");
      setIsConfirmOpen(false);
      return;
    }
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${BASE_URL}/today-schedule/add/${scheduleId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      setIsConfirmOpen(false);

      onAdded?.(); // Today 목록 새로고침

      alert("오늘 일정에 담겼습니다.");
      onClose();
    } catch (error) {
      console.error("오늘 일정 추가 실패:", error);
      alert("추가에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_URL}/schedule/delete/${scheduleId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("삭제 실패");

      onDelete?.();
      onClose();
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.scheduleCard}
        style={{ backgroundColor: category.color }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.itemContainer}>
          <div className={styles.topContainer}>
            <div className={styles.firstLineContainer}>
              <div className={styles.leftContainer}>
                <div className={styles.category}>
                  <div
                    className={styles.categoryDot}
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.name}</span>
                </div>
                <span>{title}</span>
              </div>
              {isFixed && <img src={fixed} alt="고정 아이콘" />}
            </div>
            {importance && (
              <div className={styles.importance}>
                {Array.from({ length: importance }, (_, i) => (
                  <div
                    key={`active-${i}`}
                    className={styles.importanceDotActive}
                  />
                ))}
                {Array.from({ length: 5 - importance }, (_, i) => (
                  <div
                    key={`inactive-${i}`}
                    className={styles.importanceDotInactive}
                  />
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: "6px" }}>
              <img
                src={deleteIcon}
                className={styles.deleteIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteConfirmOpen(true);
                }}
              ></img>
              <span className={styles.edit} onClick={onEdit}>
                일정 수정
              </span>
            </div>

            {isToday(date) && (
              <div
                className={styles.addBtn}
                onClick={() => setIsConfirmOpen(true)}
              >
                <img src={addIcon} alt="추가 아이콘" />
                <span>오늘 일정에 담기</span>
              </div>
            )}
          </div>

          <div className={styles.detailContainer}>
            {location && (
              <div className={styles.detailItemWrapper}>
                <img src={locationIcon} alt="위치 아이콘" />
                <span>{location}</span>
              </div>
            )}
            <div className={styles.detailItemWrapper}>
              <img src={dateIcon} alt="날짜 아이콘" />
              <span>{date}</span>
            </div>
            {isFixed && time && (
              <div className={styles.detailItemWrapper}>
                <img src={timeIcon} alt="시간 아이콘" />
                <span>{time}</span>
              </div>
            )}
          </div>
          {memo && (
            <div className={styles.memoBox}>
              <span>{memo}</span>
            </div>
          )}
        </div>
      </div>
      {isConfirmOpen && (
        <ConfirmModal
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleAddTodaySchedule}
          text="오늘 일정에 담으시겠습니까?"
        />
      )}
      {isDeleteConfirmOpen && (
        <ConfirmModal
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
          text="일정을 삭제하시겠습니까?"
        />
      )}
    </div>
  );
}
