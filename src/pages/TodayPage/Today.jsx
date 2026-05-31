import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import TodayScheduleListModal from "../../components/Modal/TodayScheduleListModal.jsx";

export default function Today() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const [selectedState, setSelectedState] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmModalText, setConfirmModalText] = useState("");
  const [confirmModalType, setConfirmModalType] = useState("");
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isTodayListOpen, setIsTodayListOpen] = useState(false);
  const [todayDateSchedules, setTodayDateSchedules] = useState([]);
  const [isReselectMode, setIsReselectMode] = useState(false);

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
        <div className={styles.ringWrapper} onClick={handleRingWrapperClick}>
          <Ring className={styles.ring} schedules={todaySchedules} />
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
          {todaySchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.todayScheduleId}
              isFixed={schedule.scheduleType === "FIXED"}
              title={schedule.title}
              category={{
                name: schedule.categoryName,
                color: schedule.categoryColor,
              }}
              importance={schedule.importance}
              date={schedule.scheduleDate}
              time={
                schedule.startTime && schedule.endTime
                  ? `${schedule.startTime.slice(0, 5)}-${schedule.endTime.slice(0, 5)}`
                  : null
              }
              location={schedule.location}
              memo={schedule.memo}
              onEdit={() => handleEdit(schedule.scheduleId)}
              onRemove={async () => {
                const accessToken = localStorage.getItem("accessToken");
                const res = await fetch(
                  `${BASE_URL}/today-schedule/remove/${schedule.todayScheduleId}`,
                  {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${accessToken}` },
                    credentials: "include",
                  },
                );
                if (res.ok) fetchTodaySchedules();
              }}
              onComplete={async () => {
                const accessToken = localStorage.getItem("accessToken");
                const res = await fetch(
                  `${BASE_URL}/today-schedule/complete/${schedule.todayScheduleId}`,
                  {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${accessToken}` },
                    credentials: "include",
                  },
                );
                if (res.ok) fetchTodaySchedules();
                console.log("완료 처리 성공");
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
              setIsTodayListOpen(true);
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
        {isTodayListOpen && (
          <TodayScheduleListModal
            onClose={() => setIsTodayListOpen(false)}
            onAdded={fetchTodaySchedules}
          />
        )}
      </div>
    </>
  );
}
