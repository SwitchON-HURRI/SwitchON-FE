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
  onEdit,
}) {
  return (
    <div
      className={styles.scheduleCard}
      style={{ backgroundColor: category.color }}
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
          <div className={styles.importance}>
            {Array.from({ length: importance }, (_, i) => (
              <div key={`active-${i}`} className={styles.importanceDotActive} />
            ))}
            {Array.from({ length: 5 - importance }, (_, i) => (
              <div key={`inactive-${i}`} className={styles.importanceDotInactive} />
            ))}
          </div>
          <span className={styles.edit} onClick={onEdit}>
            일정 수정
          </span>
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
  );
}
