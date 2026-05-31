import { useState, useRef } from "react";
import styles from "./ScheduleCard.module.css";
import fixed from "../../assets/icon/fixed.svg";
import locationIcon from "../../assets/icon/location.svg";
import dateIcon from "../../assets/icon/date.svg";
import timeIcon from "../../assets/icon/time.svg";

export default function ScheduleCard({
  isFixed,
  title,
  category,
  importance,
  date,
  time,
  location,
  memo,
  onRemove,
  onComplete,
}) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const startXRef = useRef(null);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientX - startXRef.current;
    if (diff < 0) setTranslateX(Math.max(diff, -200));
    if (diff > 0) setTranslateX(Math.min(diff, 200));
  };

  const handleTouchEnd = () => {
    if (translateX < -150) {
      onRemove?.();
    } else if (translateX < -40) {
      setTranslateX(-80);
      setIsSwiped(true);
    } else if (translateX > 150) {
      onComplete?.();
      setTranslateX(0);
    } else {
      setTranslateX(0);
      setIsSwiped(false);
    }
  };

  return (
    <div className={styles.swipeWrapper}>
      <div
        className={styles.deleteBackground}
        style={{ width: translateX < 0 ? Math.abs(translateX) : 0 }}
        onClick={onRemove}
      >
        <span>삭제</span>
      </div>
      <div
        className={styles.completeBackground}
        style={{ width: translateX > 0 ? translateX : 0 }}
        onClick={onComplete}
      >
        <span>완료</span>
      </div>
      <div
        className={styles.scheduleCard}
        style={{
          backgroundColor: category.color,
          transform: `translateX(${translateX}px)`,
          transition: startXRef.current ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 기존 내용 그대로 */}
        <div className={styles.itemContainer}>
          <div className={styles.topContainer}>
            <div className={styles.firstLineContainer}>
              <div className={styles.leftContainer}>
                <div className={styles.category}>
                  <div
                    className={styles.categoryDot}
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
                <span>{title}</span>
              </div>
              {isFixed && <img src={fixed} alt="고정 아이콘" />}
            </div>
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
    </div>
  );
}
