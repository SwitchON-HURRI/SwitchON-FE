import styles from "./SelectedState.module.css";

export default function SelectedState({ selected }) {
  return (
    <div className={styles.selectedStateContainer}>
      <span>오늘의 상태</span>
      <div className={styles.selectedStateBox}>
        <span>{selected}</span>
      </div>
    </div>
  );
}
