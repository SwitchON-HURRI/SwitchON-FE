import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import styles from "./Home.module.css";
import switchBtn from "../../assets/switch.svg";
import SelectedState from "../../components/SelectedState/SelectedState.jsx";
import ConfirmModal from "../../components/Modal/ConfirmModal.jsx";
import SleepTimeModal from "../../components/Modal/SleepTimeModal.jsx";
import TodayAddableListModal from "../../components/Modal/TodayAddableListModal.jsx";

export default function Home() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

  const [selectedState, setSelectedState] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isTodayAddableListModalOpen, setIsTodayAddableListModalOpen] =
    useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [addableSchedules, setAddableSchedules] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/category/read`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!response.ok) return;
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddableSchedules = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/schedule/read/today-addable`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!res.ok) return;
      const data = await res.json();
      setAddableSchedules(data);
      return data;
    } catch (err) {
      console.error("일정 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    const checkUserStatusAndFetch = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        // 1. 로그인 여부 체크
        if (!accessToken) {
          navigate("/login");
          return;
        }

        // 2. 오늘 이미 시작한 유저인지 체크
        const response = await fetch(`${BASE_URL}/state/read`, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });

        if (!response.ok) return;
        const data = await response.json();

        if (data?.condition) {
          navigate("/today");
          return; // 이미 시작했다면 페이지를 이동하므로 여기서 로직을 종료합니다.
        }

        // 3. 검증을 모두 통과한 안전한 상태일 때만 데이터를 가져옵니다.
        await fetchAddableSchedules();
        await fetchCategories();
      } catch (error) {
        console.error("사용자 상태 확인 실패:", error);
      }
    };

    checkUserStatusAndFetch();
  }, [navigate, BASE_URL]);

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

      // 1. 상태(Condition) 생성
      const stateResponse = await fetch(`${BASE_URL}/state/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ condition: selectedState }),
        credentials: "include",
      });

      if (!stateResponse.ok)
        throw new Error(`state 생성 실패: ${stateResponse.status}`);

      // 2. 오늘 일정 Plan 자동 배치 (처음 1회만 sleepTime 전달)
      const planResponse = await fetch(`${BASE_URL}/today-schedule/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sleepTime }),
        credentials: "include",
      });

      if (!planResponse.ok)
        throw new Error(`plan 실패: ${planResponse.status}`);

      const planData = await planResponse.json();
      console.log("planData:", planData);

      setIsSleepModalOpen(false);
      navigate("/today");
    } catch (error) {
      console.error(error);
      alert("오늘 하루 시작에 실패했습니다.");
    }
  };

  return (
    <>
      <Header />
      <div className={styles.dim} />
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

        <div style={{ position: "relative", zIndex: 1 }}>
          <SelectedState
            selected={selectedState || "선택한 값"}
            onClick={() => setSelectedState(null)}
          />
        </div>

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
          onClick={() => {
            if (addableSchedules.length === 0) {
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

        {isConfirmModalOpen && (
          <ConfirmModal
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirm}
            text="오늘 하루를 시작하시겠습니까?"
          />
        )}

        {isSleepModalOpen && (
          <SleepTimeModal
            onClose={() => setIsSleepModalOpen(false)}
            onConfirm={handleSleepSubmit}
          />
        )}

        {isTodayAddableListModalOpen && (
          <TodayAddableListModal
            schedules={addableSchedules}
            onClose={() => setIsTodayAddableListModalOpen(false)}
            onAdded={() => {
              setIsTodayAddableListModalOpen(false);
              fetchAddableSchedules();
            }}
          />
        )}
      </div>
    </>
  );
}
