import { useState } from "react";
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

export default function Today() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmModalText, setConfirmModalText] = useState("");

  const schedules = [
    { category: "study" },
    { category: "work" },
    { category: "meeting" },
    { category: "exercise" },
  ];

  const handleRingWrapperClick = (event) => {
    if (event.target.className === styles.switchBtn) {
      setConfirmModalText("오늘 하루를 종료하시겠습니까?");
    }

    if (event.target.className === styles.stopBtn) {
      setConfirmModalText("일정을 정지하시겠습니까?");
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <SelectedState selected="선택한 값" />
        <div className={styles.ringWrapper} onClick={handleRingWrapperClick}>
          <Ring className={styles.ring} schedules={schedules}/>
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
            onClick={() => {
              navigate("/manage-schedule");
            }}
          />
        </div>
        <div className={styles.scheduleList}>
          {schedules.length > 0 && (
          <ScheduleCard
            isFixed={true}
            title="일정 제목!"
            category={{ name: schedules[0]?.category || "카테고리", color: "#D4E4F1" }}
            importance={3}
            date="2026-04-05"
            time="14:00-16:00"
            location="가톨릭대학교"
            des="설명설명설명"
            onEdit={() => setIsEditModalOpen(true)}
          />
          )}
          <div
            className={styles.addScheduleBox}
            onClick={() => setIsAddModalOpen(true)}
          >
            <span>
              +<br />
              일정을 추가하세요
            </span>
          </div>
        </div>

        {isAddModalOpen && (
          <AddEditScheduleModal
            onClose={() => setIsAddModalOpen(false)}
          ></AddEditScheduleModal>
        )}
        {isEditModalOpen && (
          <AddEditScheduleModal
            mode="edit"
            onClose={() => setIsEditModalOpen(false)}
          ></AddEditScheduleModal>
        )}
        {confirmModalText && (
          <ConfirmModal
            onClose={() => setConfirmModalText("")}
            onConfirm={() => setConfirmModalText("")}
            text={confirmModalText}
          />
        )}
      </div>
    </>
  );
}
