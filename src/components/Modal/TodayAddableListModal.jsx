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
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    // 실패한 ID들과 성공한 ID들 추적
    const failedIds = [];
    const successIds = [];

    try {
      const accessToken = localStorage.getItem("accessToken");

      for (const id of selectedIds) {
        try {
          const response = await fetch(`${BASE_URL}/today-schedule/add/${id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          });

          if (response.ok) {
            successIds.push(id); // 성공 트래킹
          } else {
            console.error(`Failed to add schedule ${id}: ${response.status}`);
            failedIds.push(id); // 서버 거부 실패 트래킹
          }
        } catch (singleErr) {
          console.error(`Network error for schedule ${id}:`, singleErr);
          failedIds.push(id); // 네트워크 에러 실패 트래킹
        }
      }

      // 하나라도 성공한 게 있다면 화면 갱신
      if (successIds.length > 0) {
        setSelectedIds(new Set());
        onAdded?.();
      }

      // 일부 실패가 있었을 경우에만 알림을 띄우되, 성공한 개수도 같이 알려주기
      if (failedIds.length > 0) {
        alert(
          `선택한 일정 중 ${successIds.length}개는 추가되었지만, ${failedIds.length}개는 실패했습니다.`,
        );
      }
    } catch (err) {
      console.error(err);
      alert("일정 추가 중 예기치 못한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
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
          <button
            className={styles.btn2}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? "담는 중..."
              : selectedIds.size > 0
                ? `${selectedIds.size}개 담기`
                : "담기"}
          </button>
        </div>
      </div>
    </div>
  );
}
