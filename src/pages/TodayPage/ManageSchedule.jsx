import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import styles from "./ManageSchedule.module.css";
import backArrow from "../../assets/icon/back-arrow.svg";
import moreArrow from "../../assets/icon/more-arrow.svg";
import SelectedState from "../../components/SelectedState/SelectedState.jsx";
import ScheduleDetailModal from "../../components/Modal/ScheduleDetailModal.jsx";
import AddEditScheduleModal from "../../components/Modal/AddEditScheduleModal.jsx";

export default function ManageSchedule() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const [selectedState, setSelectedState] = useState("");
  const [categories, setCategories] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isReselectMode, setIsReselectMode] = useState(false);

  const handleStateReselect = () => {
    setIsReselectMode(true);
  };

  // 상태값 수정
  const handleStateSelect = async (condition) => {
    // 같은 값 선택 시 그냥 닫기
    if (condition === selectedState) {
      setSelectedState(condition);
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_URL}/state/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ condition }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("상태 저장 실패");

      setSelectedState(condition);
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  useEffect(() => {
    const fetchTodayState = async () => {
      const accessToken = localStorage.getItem("accessToken");

      try {
        const response = await fetch(`${BASE_URL}/state/read`, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data?.condition) setSelectedState(data.condition);
      } catch (error) {
        console.error("오늘 상태 조회 실패:", error);
      }
    };
    fetchTodayState();
  }, []);

  const fetchCategoriesWithSchedules = async () => {
    const accessToken = localStorage.getItem("accessToken");

    try {
      const categoryRes = await fetch(`${BASE_URL}/category/read`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!categoryRes.ok) return;

      const categoryList = await categoryRes.json();

      const categoriesWithSchedules = await Promise.all(
        categoryList.map(async (category) => {
          try {
            const scheduleRes = await fetch(
              `${BASE_URL}/schedule/read/category/${category.categoryId}`,
              {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
                credentials: "include",
              },
            );
            if (!scheduleRes.ok) return { ...category, schedules: [] };
            const schedules = await scheduleRes.json();

            return { ...category, schedules };
          } catch {
            return { ...category, schedules: [] };
          }
        }),
      );

      setCategories(categoriesWithSchedules);
    } catch (error) {
      console.error("카테고리 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchCategoriesWithSchedules();
  }, []);

  const CATEGORY_BG_MAP = {
    "#EEDBDF": "#F5ECEE",
    "#F4ECC8": "#FCFAEE",
    "#D4E4F1": "#EFF6FC",
  };

  const getLightColor = (hex) => CATEGORY_BG_MAP[hex] ?? `${hex}40`;

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div
          className={styles.selectStateContainer}
          style={{ display: isReselectMode ? "flex" : "none" }}
        >
          <button
            onClick={() => {
              handleStateSelect("comfort");
              setIsReselectMode(false);
            }}
          >
            comfort
          </button>
          <button
            onClick={() => {
              handleStateSelect("regular");
              setIsReselectMode(false);
            }}
          >
            regular
          </button>
          <button
            onClick={() => {
              handleStateSelect("hard");
              setIsReselectMode(false);
            }}
          >
            hard
          </button>
        </div>
        <SelectedState
          selected={selectedState}
          onClick={() =>
            isReselectMode ? setIsReselectMode(false) : handleStateReselect()
          }
        />
        <div className={styles.pageTitleWrapper}>
          <img
            src={backArrow}
            alt="뒤로가기"
            onClick={() => navigate("/today")}
          />
          <span>일정 관리</span>
        </div>

        <div className={styles.cardListContainer}>
          {categories.map((category) => (
            <div key={category.categoryId}>
              <div
                className={styles.categoryWrapper}
                style={{ backgroundColor: category.categoryColor }}
              >
                <div className={styles.categoryName}>
                  <div
                    className={styles.categoryDot}
                    style={{ backgroundColor: category.categoryColor }}
                  />
                  <span>{category.categoryName}</span>
                </div>
              </div>
              <div
                className={styles.scheduleListContainer}
                style={{
                  backgroundColor: getLightColor(category.categoryColor),
                }}
              >
                <div className={styles.scheduleItem}>
                  {(expandedCategories[category.categoryId]
                    ? category.schedules
                    : category.schedules.slice(0, 3)
                  ).map((schedule) => (
                    <span
                      key={schedule.scheduleId}
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      {schedule.title}
                    </span>
                  ))}
                </div>
                <img
                  src={moreArrow}
                  alt="더보기"
                  onClick={() => toggleCategory(category.categoryId)}
                  style={{
                    transform: expandedCategories[category.categoryId]
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {isDetailModalOpen &&
          selectedSchedule &&
          (() => {
            const category = categories.find(
              (c) => c.categoryId === selectedSchedule.categoryId,
            );
            return (
              <ScheduleDetailModal
                scheduleId={selectedSchedule.scheduleId}
                isFixed={selectedSchedule.scheduleType === "FIXED"}
                title={selectedSchedule.title}
                category={{
                  color: category?.categoryColor,
                  name: category?.categoryName,
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
                onEdit={() => setIsEditModalOpen(true)}
                onClose={() => {
                  setIsDetailModalOpen(false);
                  setSelectedSchedule(null);
                }}
                onDelete={() => {
                  fetchCategoriesWithSchedules();
                  setIsDetailModalOpen(false);
                  setSelectedSchedule(null);
                }}
              />
            );
          })()}

        {isEditModalOpen && (
          <AddEditScheduleModal
            mode="edit"
            initialValues={{
              ...selectedSchedule,

              category: {
                categoryId: selectedSchedule.categoryId,

                categoryName: categories.find(
                  (c) => c.categoryId === selectedSchedule.categoryId,
                )?.categoryName,

                categoryColor: categories.find(
                  (c) => c.categoryId === selectedSchedule.categoryId,
                )?.categoryColor,
              },

              startTime: selectedSchedule.startTime?.slice(0, 5) || "",
              endTime: selectedSchedule.endTime?.slice(0, 5) || "",
            }}
            onEditSuccess={() => {
              fetchCategoriesWithSchedules();
            }}
            onClose={() => {
              setIsEditModalOpen(false);
              setIsDetailModalOpen(false);
            }}
          />
        )}
      </div>
    </>
  );
}
