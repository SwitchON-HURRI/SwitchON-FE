import { useState } from "react";
import styles from "./TodayAddableListModal.module.css";

export default function TodayAddableListModal({
  schedules,
  categories,
  onClose,
  onAdded,
}) {
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const [selectedIds, setSelectedIds] = useState(new Set());
  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.categoryId, c.categoryColor]),
  );

  // 체크박스 토글
  const handleToggle = (scheduleId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(scheduleId) ? next.delete(scheduleId) : next.add(scheduleId);
      return next;
    });
  };

  // 한번에 추가
  const handleConfirm = async () => {
    if (selectedIds.size === 0) {
      alert("담을 일정을 1개 이상 선택해주세요.");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      await Promise.all(
        [...selectedIds].map((id) =>
          fetch(`${BASE_URL}/today-schedule/add/${id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          }),
        ),
      );
      onAdded?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.scheduleList}>
          {schedules.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className={`${styles.scheduleItem} ${selectedIds.has(schedule.scheduleId) ? styles.selected : ""}`}
              onClick={() => handleToggle(schedule.scheduleId)}
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
        <div className={styles.buttonContainer}>
          <button className={styles.btn1} onClick={onClose}>
            취소
          </button>
          <button className={styles.btn2} onClick={handleConfirm}>
            {selectedIds.size > 0 ? `${selectedIds.size}개 담기` : "담기"}
          </button>
        </div>
      </div>
    </div>
  );
}
