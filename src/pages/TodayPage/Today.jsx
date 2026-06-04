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
  const [addableSchedules, setAddableSchedules] = useState([]);

  // 자는 시간 없이 호출하는 공통 plan 재생성 함수
  const handleReloadPlanWithoutSleepTime = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      // 자는 시간(sleepTime)을 body에 실어 보내지 않고 빈 객체로 호출합니다.
      const res = await fetch(`${BASE_URL}/today-schedule/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
        credentials: "include",
      });

      if (!res.ok) throw new Error("plan 재생성 실패");

      const planData = await res.json();
      const merged = await mergePlanWithCategories(planData);

      // 응답 데이터 상태에 반영
      setPlanResult(merged);
    } catch (err) {
      console.error(err);
      alert("일정 재배치에 실패했습니다.");
    }
  };

  // 처음 Home에서 넘어오거나 최초 로드되었을 때 오늘 Plan을 가져옵니다.
  useEffect(() => {
    // 최초 진입 시에도 빈 상태의 plan을 찔러서 현재 상태를 받아오거나 새로고침 처리
    handleReloadPlanWithoutSleepTime();
  }, []);

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
    const accessToken = localStorage.getItem("accessToken");

    const res = await fetch(`${BASE_URL}/schedule/read/today-addable`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    });

    const data = await res.json();
    setAddableSchedules(data);
    return data;
  };

  const handleStateReselect = () => {
    setIsReselectMode(true);
  };

  // 상태값 수정
  const handleStateSelect = async (condition) => {
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
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${BASE_URL}/category/read`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    });

    if (!response.ok) return;
    const data = await response.json();
    setCategories(data);
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

        const resetResponse = await fetch(`${BASE_URL}/today-schedule/reset`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });

        if (!resetResponse.ok)
          throw new Error(`reset 실패: ${resetResponse.status}`);

        await fetch(`${BASE_URL}/state/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
          credentials: "include",
        });

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
          headers: { Authorization: `Bearer ${accessToken}` },
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
                    // 모달을 띄우지 않고 바로 plan API 재요청 후 응답 반영
                    handleReloadPlanWithoutSleepTime();
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
          <AddEditScheduleModal onClose={() => setIsAddModalOpen(false)} />
        )}
        {confirmModalText && (
          <ConfirmModal
            onClose={handleCloseConfirmModal}
            onConfirm={handleConfirm}
            text={confirmModalText}
          />
        )}
        {isTodayAddableListModalOpen && (
          <TodayAddableListModal
            schedules={addableSchedules}
            categories={categories}
            onClose={() => setIsTodayAddableListModalOpen(false)}
            onAdded={() => {
              setIsTodayAddableListModalOpen(false);
              handleReloadPlanWithoutSleepTime();
            }}
          />
        )}
      </div>
    </>
  );
}
