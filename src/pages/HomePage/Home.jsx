import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import styles from "./Home.module.css";
import switchBtn from "../../assets/switch.svg";
import SelectedState from "../../components/SelectedState/SelectedState.jsx";
import ConfirmModal from "../../components/Modal/ConfirmModal.jsx";
import AddEditScheduleModal from "../../components/Modal/AddEditScheduleModal.jsx";

export default function Home() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAddEditScheduleModalOpen, setIsAddEditScheduleModalOpen] =
    useState(false);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div
          className={styles.selectStateContainer}
          style={{ visibility: selectedState ? "hidden" : "visible" }}
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
            onConfirm={() => {
              setIsConfirmModalOpen(false);
              navigate("/today");
            }}
            text="오늘 하루를 시작하시겠습니까?"
          />
        )}

        {isAddEditScheduleModalOpen && (
          <AddEditScheduleModal
            mode="add"
            onClose={() => setIsAddEditScheduleModalOpen(false)}
          />
        )}
      </div>
    </>
  );
}
