import { useState } from "react";
import Header from "../../components/Header/Header.jsx";
import styles from "./Monthly.module.css";
import Calendar from "./Calendar.jsx";
import ScheduleListModal from "../../components/Modal/ScheduleListModal.jsx";

export default function Monthly() {
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
  
  return (
    <>
      <Header />
      <div className={styles.container}>
        <Calendar onDateClick={handleDateClick} refreshKey={refreshKey} />
        {isModalOpen && (
          <ScheduleListModal
            date={selectedDate}
            onClose={() => setIsModalOpen(false)}
            onChanged={triggerRefresh}
          />
        )}
      </div>
    </>
  );
}
