import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import styles from "./Today.module.css";
import switchBtn from "../../assets/switch.svg";
import stopBtn from "../../assets/icon/stop.svg";
import addBtn from "../../assets/icon/add.svg";
import manageBtn from "../../assets/icon/manage.svg";
import SelectedState from "../../components/SelectedState/SelectedState.jsx";
import ScheduleCard from "../../components/ScheduleCard/ScheduleCard.jsx";
import AddEditScheduleModal from "../../components/Modal/AddEditScheduleModal.jsx";
import ConfirmModal from "../../components/Modal/ConfirmModal.jsx";
import Ring from "../../components/Ring/Ring.jsx";
import TodayAddableListModal from "../../components/Modal/TodayAddableListModal.jsx";
import SleepTimeModal from "../../components/Modal/SleepTimeModal.jsx";

export default function Today() {
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedState, setSelectedState] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmModalText, setConfirmModalText] = useState("");
  const [confirmModalType, setConfirmModalType] = useState("");
  const [categories, setCategories] = useState([]);
  const [isTodayAddableListModalOpen, setIsTodayAddableListModalOpen] =
    useState(false);
  const [isReselectMode, setIsReselectMode] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const enrichedBlocks = planResult?.blocks ?? [];
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [addableSchedules, setAddableSchedules] = useState([]);

  const mergePlanWithCategories = async (planData) => {
    const accessToken = localStorage.getItem("accessToken");

    const res = await fetch(`${BASE_URL}/today-schedule/today`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    });

    const todayList = await res.json();

    const map = {};
    todayList.forEach((s) => {
      map[s.todayScheduleId] = {
        categoryName: s.categoryName,
        categoryColor: s.categoryColor,
        scheduleDate: s.scheduleDate,
      };
    });

    const merged = planData.blocks.map((block) => ({
      ...block,
      categoryName:
        map[block.todayScheduleId]?.categoryName ?? block.categoryName,
      categoryColor:
        map[block.todayScheduleId]?.categoryColor ?? block.categoryColor,
      scheduleDate:
        map[block.todayScheduleId]?.scheduleDate ?? block.scheduleDate,
    }));

    return {
      ...planData,
      blocks: merged,
    };
  };

  const fetchAddableSchedules = async () => {
    const dummyData = [
      {
        scheduleId: 1,
        title: "오픽 공부하기",
        categoryId: 1,
      },
      {
        scheduleId: 2,
        title: "유튜브 편집하기",
        categoryId: 2,
      },
      {
        scheduleId: 3,
        title: "알바",
        categoryId: 3,
      },
    ];

    setAddableSchedules(dummyData);
    return dummyData;

    // const accessToken = localStorage.getItem("accessToken");

    // const res = await fetch(`${BASE_URL}/schedule/read/today-addable`, {
    //   headers: { Authorization: `Bearer ${accessToken}` },
    //   credentials: "include",
    // });

    // const data = await res.json();

    // setAddableSchedules(data);
    // return data;
  };

  useEffect(() => {
    if (location.state?.openSleepModal) {
      setIsSleepModalOpen(true);
    }
  }, []);

  useEffect(() => {
    const loadPlan = async () => {
      const saved = getPlanResult();
      if (!saved) return;

      const merged = await mergePlanWithCategories(saved);

      setPlanResult(merged);
    };

    loadPlan();
  }, []);

  const handlePlanResubmit = async (sleepTime) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_URL}/today-schedule/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sleepTime }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("plan 재생성 실패");

      const planData = await res.json();

      const merged = await mergePlanWithCategories(planData);

      setPlanResult(merged);
      savePlanResult(merged);
      setIsSleepModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("일정 재배치에 실패했습니다.");
    }
  };

  const getPlanResult = () => {
    const saved = localStorage.getItem("planResult");
    const savedDate = localStorage.getItem("planDate");
    const today = new Date().toISOString().slice(0, 10);
    if (saved && savedDate === today) return JSON.parse(saved);
    return null;
  };

  const savePlanResult = (planData) => {
    const today = new Date().toISOString().slice(0, 10);

    localStorage.setItem("planResult", JSON.stringify(planData));
    localStorage.setItem("planDate", today);
  };

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

  const fetchCategories = async () => {
    const dummyCategories = [
      {
        categoryId: 1,
        categoryName: "공부",
        categoryColor: "#F4ECC8",
      },
      {
        categoryId: 2,
        categoryName: "취미",
        categoryColor: "#CFD6C6",
      },
      {
        categoryId: 3,
        categoryName: "알바",
        categoryColor: "#EEDBDF",
      },
    ];

    setCategories(dummyCategories);

    // const accessToken = localStorage.getItem("accessToken");

    // const response = await fetch(`${BASE_URL}/category/read`, {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    //   credentials: "include",
    // });

    // if (!response.ok) return;

    // const data = await response.json();

    // setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleRingWrapperClick = (event) => {
    if (event.target.className === styles.switchBtn) {
      setConfirmModalType("switch");
      setConfirmModalText("오늘 하루를 종료하시겠습니까?");
    }

    if (event.target.className === styles.stopBtn) {
      setConfirmModalType("stop");
      setConfirmModalText("일정을 정지하시겠습니까?");
    }
  };

  // 오늘 스위치 끄기
  const handleConfirm = async () => {
    if (confirmModalType === "switch") {
      try {
        const accessToken = localStorage.getItem("accessToken");

        // 1. 오늘 일정 reset
        const resetResponse = await fetch(`${BASE_URL}/today-schedule/reset`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (!resetResponse.ok) {
          throw new Error(`reset 실패: ${resetResponse.status}`);
        }

        // 상태 삭제 (상태값의 유무가 하루의 시작 유무)
        await fetch(`${BASE_URL}/state/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
          credentials: "include",
        });
        localStorage.removeItem("planResult");
        localStorage.removeItem("planDate");
        navigate("/");
      } catch (error) {
        console.error("스위치 종료 실패:", error);

        alert("오늘 하루 종료에 실패했습니다.");
      }

      return;
    }

    setConfirmModalText("");
    setConfirmModalType("");
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalText("");
    setConfirmModalType("");
  };

  useEffect(() => {
    const fetchTodayState = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`${BASE_URL}/state/read`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data?.condition) {
          setSelectedState(data.condition);
        }
      } catch (error) {
        console.error("오늘 상태 조회 실패:", error);
      }
    };

    fetchTodayState();
  }, []);

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
        <div
          className={styles.ringWrapper}
          style={{
            backgroundImage:
              enrichedBlocks.filter(
                (b) => b.blockType === "TASK" && !b.isCompleted,
              ).length > 0
                ? "none"
                : undefined,
          }}
          onClick={handleRingWrapperClick}
        >
          <Ring
            className={styles.ring}
            schedules={enrichedBlocks.filter(
              (b) => b.blockType === "TASK" && !b.isCompleted,
            )}
          />
          <img className={styles.switchBtn} src={switchBtn} alt="스위치 버튼" />
          <img className={styles.stopBtn} src={stopBtn} alt="일정 정지 버튼" />
          <img
            className={styles.addBtn}
            src={addBtn}
            alt="일정 추가 버튼"
            onClick={() => setIsAddModalOpen(true)}
          />
          <img
            className={styles.manageBtn}
            src={manageBtn}
            alt="일정 관리 버튼"
            onClick={() => navigate("/manage-schedule")}
          />
        </div>
        <div className={styles.scheduleList}>
          {/* todaySchedules 대신 enrichedBlocks 사용 */}
          {enrichedBlocks
            .filter((block) => block.blockType === "TASK" && !block.isCompleted)
            .map((block) => (
              <ScheduleCard
                key={block.todayScheduleId}
                isFixed={block.scheduleType === "FIXED"}
                title={block.title}
                category={{
                  name: block.categoryName,
                  color: block.categoryColor,
                }}
                importance={block.importance}
                date={block.scheduleDate}
                time={
                  block.plannedStartTime && block.plannedEndTime
                    ? `${block.plannedStartTime.slice(11, 16)}-${block.plannedEndTime.slice(11, 16)}`
                    : null
                }
                onRemove={async () => {
                  const accessToken = localStorage.getItem("accessToken");
                  const res = await fetch(
                    `${BASE_URL}/today-schedule/remove/${block.todayScheduleId}`,
                    {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${accessToken}` },
                      credentials: "include",
                    },
                  );
                  if (res.ok) {
                    // plan 재호출 필요 → sleepModal 띄우기
                    setIsSleepModalOpen(true);
                  }
                }}
                onComplete={async () => {
                  const accessToken = localStorage.getItem("accessToken");

                  const res = await fetch(
                    `${BASE_URL}/today-schedule/complete/${block.todayScheduleId}`,
                    {
                      method: "PATCH",
                      headers: { Authorization: `Bearer ${accessToken}` },
                      credentials: "include",
                    },
                  );

                  if (!res.ok) return;

                  setPlanResult((prev) => {
                    const updated = {
                      ...prev,
                      blocks: prev.blocks.map((b) =>
                        b.todayScheduleId === block.todayScheduleId
                          ? { ...b, isCompleted: true }
                          : b,
                      ),
                    };

                    savePlanResult(updated);
                    return updated;
                  });
                }}
              />
            ))}
          <div
            className={styles.addScheduleBox}
            onClick={async () => {
              const data = await fetchAddableSchedules();

              if (data.length === 0) {
                alert("담을 일정이 없습니다.");
                return;
              }

              setIsTodayAddableListModalOpen(true);
            }}
          >
            <span>
              +<br />
              오늘 일정을 담아보세요
            </span>
          </div>
        </div>
        {isAddModalOpen && (
          <AddEditScheduleModal
            onClose={() => {
              setIsAddModalOpen(false);
            }}
          />
        )}
        {confirmModalText && (
          <ConfirmModal
            onClose={handleCloseConfirmModal}
            onConfirm={handleConfirm}
            text={confirmModalText}
          />
        )}
        {isSleepModalOpen && (
          <SleepTimeModal
            onClose={() => setIsSleepModalOpen(false)}
            onConfirm={handlePlanResubmit}
          />
        )}
        {isTodayAddableListModalOpen && (
          <TodayAddableListModal
            schedules={addableSchedules}
            categories={categories}
            onClose={() => setIsTodayAddableListModalOpen(false)}
            onAdded={() => {
              setIsTodayAddableListModalOpen(false);
              setIsSleepModalOpen(true); // 담기 완료 → 잘 시간 재입력
            }}
          />
        )}
      </div>
    </>
  );
}
