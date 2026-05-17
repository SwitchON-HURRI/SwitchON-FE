import { useState } from "react";
import styles from "./AddEditScheduleModal.module.css";
import fixed from "../../assets/icon/fixed.svg";
import fixed2 from "../../assets/icon/fixed-2.svg";
import CategorySelectModal from "./CategorySelectModal.jsx";

export default function AddEditScheduleModal({
  onClose,
  mode = "add",
  initialValues = {},
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const [isFixed, setIsFixed] = useState(initialValues.isFixed || false);
  const [isCategorySelectModalOpen, setIsCategorySelectModalOpen] =
    useState(false);
  const [formData, setFormData] = useState({
    title: initialValues.title || "",
    category: initialValues.category || { color: "#e0e0e0", name: "" },
    importance: initialValues.importance || 3,
    dueDate: initialValues.dueDate || "",
    place: initialValues.place || "",
    time: initialValues.time || "",
  });

  const toggleFixed = () => {
    setIsFixed((prev) => !prev);
  };

  const handleChange = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const selectImportance = (value) => {
    setFormData((prev) => ({ ...prev, importance: value }));
  };

  const selectCategory = (category) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit({ ...formData, isFixed });
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.containerHeader}>
          <span className={styles.title}>
            {isEdit ? "일정 수정" : "일정 추가"}
          </span>
          <img
            src={isFixed ? fixed2 : fixed}
            onClick={toggleFixed}
            alt={isFixed ? "고정 일정" : "일반 일정"}
          />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <div className={styles.wrapper}>
              <span className={styles.label}>일정 이름</span>
              <input
                type="text"
                value={formData.title}
                onChange={handleChange("title")}
                placeholder="일정 이름을 입력하세요."
              />
            </div>
            <div className={styles.rowWrapper}>
              <div className={styles.wrapper}>
                <span className={styles.label}>카테고리</span>
                <div
                  className={styles.category}
                  onClick={() => setIsCategorySelectModalOpen(true)}
                >
                  <div
                    className={styles.categoryDot}
                    style={{ backgroundColor: formData.category?.color }}
                  ></div>
                  <span>{formData.category?.name || "선택"}</span>
                </div>
              </div>
              <div className={styles.wrapper}>
                <span className={styles.label}>중요도</span>
                <div className={styles.importance}>
                  {Array.from({ length: formData.importance }, (_, i) => (
                    <div
                      key={`active-${i}`}
                      className={styles.importanceDotActive}
                      onClick={() => selectImportance(i + 1)}
                    />
                  ))}
                  {Array.from({ length: 5 - formData.importance }, (_, i) => (
                    <div
                      key={`inactive-${i}`}
                      className={styles.importanceDotInactive}
                      onClick={() =>
                        selectImportance(formData.importance + i + 1)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div className={styles.wrapper}>
                <span className={styles.label}>마감일</span>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange("dueDate")}
                />
              </div>
              <div className={styles.wrapper}>
                <span className={styles.label}>장소</span>
                <input
                  type="text"
                  value={formData.place}
                  onChange={handleChange("place")}
                  placeholder="장소를 입력하세요."
                />
              </div>
            </div>

            {isFixed && (
              <div className={styles.rowWrapper}>
                <div className={styles.wrapper}>
                  <span className={styles.label}>시간</span>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={handleChange("time")}
                  />
                </div>
                <div className={styles.wrapper}></div>
              </div>
            )}
          </div>

          <div className={styles.buttonContainer}>
            <button type="button" className={styles.btn1} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.btn2}>
              {isEdit ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>

      {isCategorySelectModalOpen && (
        <CategorySelectModal
          onClose={() => setIsCategorySelectModalOpen(false)}
          onSelect={selectCategory}
        />
      )}
    </div>
  );
}
