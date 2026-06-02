import { useState } from "react";
import Header from "../../components/Header/Header.jsx";
import styles from "./Monthly.module.css";
import Calendar from "./Calendar.jsx";
import ScheduleListModal from "../../components/Modal/ScheduleListModal.jsx";

export default function Monthly() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <Calendar onDateClick={handleDateClick} />
        {isModalOpen && (
          <ScheduleListModal date={selectedDate} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    </>
  );
}
