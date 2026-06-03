import { useState } from "react";
import styles from "./AddEditScheduleModal.module.css";
import fixed from "../../assets/icon/fixed.svg";
import fixed2 from "../../assets/icon/fixed-2.svg";
import CategorySelectModal from "./CategorySelectModal.jsx";

const formatTime = (time) => {
  if (!time) return "00:00:00";
  return time.length === 5 ? `${time}:00` : time;
};

export default function AddEditScheduleModal({
  onClose,
  mode = "add",
  initialValues = {},
  onSubmit,
  onEditSuccess,
}) {
  const isEdit = mode === "edit";
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCategorySelectModalOpen, setIsCategorySelectModalOpen] =
    useState(false);

  const [formData, setFormData] = useState({
    title: initialValues.title || "",
    category: initialValues.category || {
      categoryColor: "#e0e0e0",
      categoryName: "선택",
    },
    importance: initialValues.importance || 3,
    estimatedMinutes: initialValues.estimatedMinutes || 60,
    dueDate: initialValues.scheduleDate || "",
    location: initialValues.location || "",
    memo: initialValues.memo || "",
    startTime: initialValues.startTime || "",
    endTime: initialValues.endTime || "",
    isFixed: initialValues.scheduleType === "FIXED" || false,
  });

  const toggleFixed = () => {
    setFormData((prev) => ({
      ...prev,
      isFixed: !prev.isFixed,
    }));
  };

  const handleChange = (key) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [key]:
        key === "importance" || key === "estimatedMinutes"
          ? Number(event.target.value)
          : event.target.value,
    }));
  };

  const selectImportance = (value) => {
    setFormData((prev) => ({
      ...prev,
      importance: value,
    }));
  };

  const selectCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.dueDate) {
      alert("마감일을 선택해주세요.");
      return;
    }

    const categoryId = Number(formData.category?.categoryId) || null;

    if (!categoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    let payload;

    if (formData.isFixed) {
      if (!formData.startTime) {
        alert("시작 시간을 선택해주세요.");
        return;
      }
      if (!formData.endTime) {
        alert("종료 시간을 선택해주세요.");
        return;
      }

      if (formData.startTime >= formData.endTime) {
        alert("종료 시간은 시작 시간보다 늦어야 합니다.");
        return;
      }

      payload = {
        categoryId,
        title: formData.title || "제목 없음",

        scheduleType: "FIXED",
        scheduleDate: formData.dueDate,

        startTime: formatTime(formData.startTime),
        endTime: formatTime(formData.endTime),

        memo: formData.memo || "",
        location: formData.location || "",
      };
    } else {
      if (formData.estimatedMinutes < 1) {
        alert("예상 소요시간은 1분 이상이어야 합니다.");
        return;
      }

      payload = {
        categoryId,
        title: formData.title || "제목 없음",

        scheduleType: "FLEXIBLE",
        scheduleDate: formData.dueDate,

        estimatedMinutes: formData.estimatedMinutes,

        importance: formData.importance,

        memo: formData.memo || "",
        location: formData.location || "",

        startTime: null,
        endTime: null,
      };
    }

    console.log(payload);

    if (onSubmit) {
      onSubmit({ ...formData, payload });
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);

      const accessToken = localStorage.getItem("accessToken");

      const url = isEdit
        ? `${BASE_URL}/schedule/update/${initialValues.scheduleId}`
        : `${BASE_URL}/schedule/create`;

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify(payload),

        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`HTTP error: ${response.status} ${errorText}`);
      }
      onEditSuccess?.();
      onClose();
    } catch (error) {
      console.error("일정 생성 실패:", error);

      alert("일정 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.containerHeader}>
          <span className={styles.title}>
            {isEdit ? "일정 수정" : "일정 추가"}
          </span>

          <img
            src={formData.isFixed ? fixed2 : fixed}
            onClick={toggleFixed}
            alt={formData.isFixed ? "고정 일정" : "일반 일정"}
          />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <div className={styles.rowWrapper}>
              <div className={styles.wrapper}>
                <span className={styles.label}>일정 이름</span>

                <input
                  type="text"
                  value={formData.title}
                  onChange={handleChange("title")}
                  placeholder="일정 이름을 입력하세요."
                />
              </div>

              <div className={styles.wrapper}>
                <span className={styles.label}>카테고리</span>

                <div
                  className={styles.category}
                  onClick={() => setIsCategorySelectModalOpen(true)}
                >
                  <div
                    className={styles.categoryDot}
                    style={{
                      backgroundColor: formData.category?.categoryColor,
                    }}
                  />

                  <span>{formData.category?.categoryName}</span>
                </div>
              </div>
            </div>

            {/* FLEXIBLE */}
            {!formData.isFixed && (
              <>
                <div className={styles.rowWrapper}>
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

                      {Array.from(
                        {
                          length: 5 - formData.importance,
                        },
                        (_, i) => (
                          <div
                            key={`inactive-${i}`}
                            className={styles.importanceDotInactive}
                            onClick={() =>
                              selectImportance(formData.importance + i + 1)
                            }
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <div className={styles.wrapper}>
                    <span className={styles.label}>장소</span>

                    <input
                      type="text"
                      value={formData.location}
                      onChange={handleChange("location")}
                      placeholder="장소를 입력하세요."
                    />
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
                    <span className={styles.label}>예상 소요시간(분)</span>

                    <input
                      type="number"
                      min="1"
                      value={formData.estimatedMinutes}
                      onChange={handleChange("estimatedMinutes")}
                    />
                  </div>
                </div>
              </>
            )}

            {/* FIXED */}
            {formData.isFixed && (
              <>
                <div className={styles.rowWrapper}>
                  <div className={styles.wrapper}>
                    <span className={styles.label}>장소</span>

                    <input
                      type="text"
                      value={formData.location}
                      onChange={handleChange("location")}
                      placeholder="장소를 입력하세요."
                    />
                  </div>

                  <div className={styles.wrapper}>
                    <span className={styles.label}>마감일</span>

                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={handleChange("dueDate")}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.isFixed && (
              <div className={styles.rowWrapper}>
                <div className={styles.wrapper}>
                  <span className={styles.label}>시작 시간</span>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange("startTime")}
                  />
                </div>
                <div className={styles.wrapper}>
                  <span className={styles.label}>종료 시간</span>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange("endTime")}
                  />
                </div>
              </div>
            )}

            <div className={styles.wrapper}>
              <span className={styles.label}>메모</span>

              <input
                type="text"
                value={formData.memo}
                onChange={handleChange("memo")}
                placeholder="메모를 입력하세요."
              />
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button type="button" className={styles.btn1} onClick={onClose}>
              취소
            </button>

            <button
              type="submit"
              className={styles.btn2}
              disabled={isSubmitting}
            >
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
