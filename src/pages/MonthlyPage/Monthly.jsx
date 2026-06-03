import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import styles from "./Monthly.module.css";
import Calendar from "./Calendar.jsx";
import ScheduleListModal from "../../components/Modal/ScheduleListModal.jsx";

export default function Monthly() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };
  // 상세창에서 "오늘 일정에 담기"를 눌렀을 때 실행될 핸들러
  const handleScheduleChanged = () => {
    setRefreshKey((prev) => prev + 1);
    setIsModalOpen(false);
    navigate("/today", { state: { openSleepModal: true } });
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <Calendar onDateClick={handleDateClick} refreshKey={refreshKey} />
        {isModalOpen && (
          <ScheduleListModal
            date={selectedDate}
            onClose={() => setIsModalOpen(false)}
            onChanged={handleScheduleChanged}
          />
        )}
      </div>
    </>
  );
}
