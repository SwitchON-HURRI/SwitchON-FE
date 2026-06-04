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

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // 상세창에서 "오늘 일정에 담기"를 눌렀을 때 실행될 핸들러
  const handleScheduleChanged = () => {
    setRefreshKey((prev) => prev + 1);
    setIsModalOpen(false);

    // 이제 /today 페이지 진입 시 자동으로 빈 바디의 plan API를 호출하여 화면을 동기화합니다.
    navigate("/today");
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
            onScheduleAdded={triggerRefresh}
          />
        )}
      </div>
    </>
  );
}
