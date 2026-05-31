import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import styles from "./Home.module.css";
import switchBtn from "../../assets/switch.svg";
import SelectedState from "../../components/SelectedState/SelectedState.jsx";
import ConfirmModal from "../../components/Modal/ConfirmModal.jsx";
import AddEditScheduleModal from "../../components/Modal/AddEditScheduleModal.jsx";
import SleepTimeModal from "../../components/Modal/SleepTimeModal.jsx";

export default function Home() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

  const [selectedState, setSelectedState] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAddEditScheduleModalOpen, setIsAddEditScheduleModalOpen] =
    useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);

  // 스위치 ON 확인
  const handleConfirm = async () => {
    if (!selectedState) {
      alert("상태를 선택해주세요.");
      setIsConfirmModalOpen(false);
      return;
    }

    setIsConfirmModalOpen(false);
    setIsSleepModalOpen(true);
  };

  // sleepTime 제출 → 오늘의 상태 생성 및 오늘 일정 자동 배치
  const handleSleepSubmit = async (sleepTime) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      // 1. 상태 생성
      const stateResponse = await fetch(`${BASE_URL}/state/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          condition: selectedState,
        }),
        credentials: "include",
      });

      if (!stateResponse.ok) {
        throw new Error(`state 생성 실패: ${stateResponse.status}`);
      }

      // 2. 자동배치
      const planResponse = await fetch(`${BASE_URL}/today-schedule/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sleepTime,
        }),
        credentials: "include",
      });

      if (!planResponse.ok) {
        throw new Error(`plan 실패: ${planResponse.status}`);
      }

      setIsSleepModalOpen(false);

      navigate("/today");
    } catch (error) {
      console.error(error);

      alert("오늘 하루 시작에 실패했습니다.");
    }
  };

  // Home 진입 시 이미 시작한 하루면 Today 이동
  useEffect(() => {
    const hasTodayState = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          navigate("/login");
          return;
        }

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
          navigate("/today");
        }
      } catch (error) {
        console.error("오늘 상태 조회 실패:", error);
      }
    };

    hasTodayState();
  }, []);

  return (
    <>
      <Header />

      <div className={styles.container}>
        <div
          className={styles.selectStateContainer}
          style={{
            visibility: selectedState ? "hidden" : "visible",
          }}
        >
          <button onClick={() => setSelectedState("comfort")}>comfort</button>

          <button onClick={() => setSelectedState("regular")}>regular</button>

          <button onClick={() => setSelectedState("hard")}>hard</button>
        </div>

        <SelectedState selected={selectedState || "선택한 값"} />

        <div className={styles.ringWrapper}>
          <img
            className={styles.switchBtn}
            src={switchBtn}
            alt="스위치 버튼"
            onClick={() => setIsConfirmModalOpen(true)}
          />
        </div>

        <div
          className={styles.addScheduleBox}
          onClick={() => setIsAddEditScheduleModalOpen(true)}
        >
          <span>
            +<br />
            일정을 추가하세요
          </span>
        </div>

        {isConfirmModalOpen && (
          <ConfirmModal
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirm}
            text="오늘 하루를 시작하시겠습니까?"
          />
        )}

        {isAddEditScheduleModalOpen && (
          <AddEditScheduleModal
            mode="add"
            onClose={() => setIsAddEditScheduleModalOpen(false)}
          />
        )}

        {isSleepModalOpen && (
          <SleepTimeModal
            onClose={() => setIsSleepModalOpen(false)}
            onConfirm={handleSleepSubmit}
          />
        )}
      </div>
    </>
  );
}
