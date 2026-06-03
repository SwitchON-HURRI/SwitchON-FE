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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmModalText, setConfirmModalText] = useState("");
  const [confirmModalType, setConfirmModalType] = useState("");
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isTodayAddableListModalOpen, setIsTodayAddableListModalOpen] =
    useState(false);
  const [todayDateSchedules, setTodayDateSchedules] = useState([]);
  const [isReselectMode, setIsReselectMode] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [enrichedBlocks, setEnrichedBlocks] = useState([]);

  useEffect(() => {
    if (location.state?.openSleepModal) {
      setIsSleepModalOpen(true);
    }
  }, []);

  // planResult가 세팅되면 todaySchedules랑 합치기
  useEffect(() => {
    if (!planResult) return;

    const merge = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/today-schedule/today`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const todayList = await res.json();
      console.log("todayList:", todayList); // categoryColor 있는지 확인
      console.log("planResult.blocks:", planResult.blocks); // categoryColor 있는지 확인

      // todayScheduleId 기준으로 category 정보 매핑
      const map = {};
      todayList.forEach((s) => {
        map[String(s.todayScheduleId)] = {
          categoryName: s.categoryName,
          categoryColor: s.categoryColor,
          scheduleDate: s.scheduleDate,
        };
      });

      const merged = planResult.blocks.map((block) => ({
        ...block,
        categoryName:
          map[String(block.todayScheduleId)]?.categoryName ??
          block.categoryName,
        categoryColor:
          map[String(block.todayScheduleId)]?.categoryColor ??
          block.categoryColor,
        scheduleDate:
          map[String(block.todayScheduleId)]?.scheduleDate ??
          block.scheduleDate,
      }));
      console.log("merged:", merged); // categoryColor 있는지 확인
      console.log("map keys:", Object.keys(map));
      console.log(
        "block todayScheduleIds:",
        planResult.blocks.map((b) => b.todayScheduleId),
      );
      console.log(
        "merged categoryColors:",
        merged.map((b) => ({ id: b.todayScheduleId, color: b.categoryColor })),
      );

      setEnrichedBlocks(merged);
      savePlanResultWithCategories(planResult, merged);
    };

    merge();
  }, [planResult]);

  // 진입 시 localStorage에서 plan 로드
  useEffect(() => {
    const saved = getPlanResult();
    if (saved) setPlanResult(saved);
  }, []);

  // TodayScheduleListModal의 onAdded → SleepTimeModal 띄우기로 변경
  const handlePlanResubmit = async (sleepTime) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const planResponse = await fetch(`${BASE_URL}/today-schedule/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sleepTime }),
        credentials: "include",
      });

      if (!planResponse.ok) throw new Error("plan 재생성 실패");

      const planData = await planResponse.json();
      savePlanResultWithCategories(planData, enrichedBlocks); // localStorage 갱신
      setPlanResult(planData); // 화면 즉시 반영
      setIsSleepModalOpen(false);
    } catch (error) {
      console.error(error);
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

  const savePlanResultWithCategories = (planData, enriched) => {
    const today = new Date().toISOString().slice(0, 10);

    const enrichedPlanData = {
      ...planData,
      blocks: enriched,
    };

    localStorage.setItem("planResult", JSON.stringify(enrichedPlanData));
    localStorage.setItem("planDate", today);
  };
  const handleStateReselect = () => {
    setIsReselectMode(true);
  };

  const fetchTodayDateSchedules = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      const res = await fetch(
        `${BASE_URL}/schedule/read/date?date=${yyyy}-${mm}-${dd}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        },
      );
      const data = await res.json();
      setTodayDateSchedules(data);
    } catch (err) {
      setTodayDateSchedules([]);
    }
  };

  useEffect(() => {
    fetchTodayDateSchedules();
  }, []);

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
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${BASE_URL}/category/read`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    if (!response.ok) return;

    const data = await response.json();

    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = async (scheduleId) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(`${BASE_URL}/schedule/read/${scheduleId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(response.status);
      }

      const data = await response.json();

      setEditingSchedule(data);
    } catch (error) {
      console.error("일정 단건 조회 실패:", error);
    }
  };

  // 오늘 일정 목록 불러오기
  const fetchTodaySchedules = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(`${BASE_URL}/today-schedule/today`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(response.status);
      }

      const data = await response.json();
      setTodaySchedules(data.filter((s) => !s.isCompleted)); // 완료된 일정 안 보이게 필터링
    } catch (error) {
      console.error("오늘 일정 조회 실패:", error);
      setTodaySchedules([]);
    }
  };

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

  useEffect(() => {
    fetchTodaySchedules();
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
                onEdit={() => handleEdit(block.scheduleId)}
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
                  if (res.ok) {
                    // enrichedBlocks 업데이트
                    setEnrichedBlocks((prev) =>
                      prev.map((b) =>
                        b.todayScheduleId === block.todayScheduleId
                          ? { ...b, isCompleted: true }
                          : b,
                      ),
                    );
                    // planResult도 업데이트 후 localStorage 저장
                    setPlanResult((prev) => {
                      const updated = {
                        ...prev,
                        blocks: prev.blocks.map((b) =>
                          b.todayScheduleId === block.todayScheduleId
                            ? { ...b, isCompleted: true }
                            : b,
                        ),
                      };
                      savePlanResultWithCategories(updated, enrichedBlocks); // localStorage 갱신
                      return updated;
                    });
                  }
                }}
              />
            ))}
          <div
            className={styles.addScheduleBox}
            onClick={() => {
              if (todayDateSchedules.length === 0) {
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
              fetchTodaySchedules();
            }}
          />
        )}
        {editingSchedule && (
          <AddEditScheduleModal
            mode="edit"
            initialValues={{
              ...editingSchedule,

              category: {
                categoryId: editingSchedule.categoryId,

                categoryName: categories.find(
                  (c) => c.categoryId === editingSchedule.categoryId,
                )?.categoryName,

                categoryColor: categories.find(
                  (c) => c.categoryId === editingSchedule.categoryId,
                )?.categoryColor,
              },

              startTime: editingSchedule.startTime?.slice(0, 5) || "",

              endTime: editingSchedule.endTime?.slice(0, 5) || "",
            }}
            onEditSuccess={() => {
              fetchTodaySchedules();
              setEditingSchedule(null);
            }}
            onClose={() => setEditingSchedule(null)}
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
