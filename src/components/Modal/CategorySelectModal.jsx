import styles from "./CategorySelectModal.module.css";

const categories = [
  { id: 1, name: "업무", color: "#FF6B6B" },
  { id: 2, name: "공부", color: "#4ECDC4" },
  { id: 3, name: "운동", color: "#45B7D1" },
  { id: 4, name: "개인", color: "#FFA07A" },
  { id: 5, name: "기타", color: "#98D8C8" },
  { id: 6, name: "쇼핑", color: "#F7DC6F" },
  { id: 7, name: "휴식", color: "#BB8FCE" },
  { id: 8, name: "약속", color: "#85C1E2" },
];

export default function CategorySelectModal({ onClose, onSelect }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>카테고리 선택</span>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={styles.categoryItem}
              onClick={() => {
                onSelect(category);
                onClose();
              }}
            >
              <div
                className={styles.categoryItemDot}
                style={{ backgroundColor: category.color }}
              ></div>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
