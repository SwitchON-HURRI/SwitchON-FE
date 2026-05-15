import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";

const eventData = [
  { start: "2025-03-02", end: "2025-03-02", color: "#D4E4F1" },
  { start: "2025-03-02", end: "2025-03-02", color: "#F4ECC8" },
  { start: "2025-03-04", end: "2025-03-05", color: "#D4E4F1" },
  { start: "2025-03-04", end: "2025-03-04", color: "#F4ECC8" },
  { start: "2025-03-04", end: "2025-03-04", color: "#DBD4DC" },
  { start: "2025-03-04", end: "2025-03-04", color: "#CFD6C6" },
  { start: "2025-03-09", end: "2025-03-13", color: "#CFD6C6" },
  { start: "2025-03-11", end: "2025-03-13", color: "#EEDBDF" },
  { start: "2025-03-12", end: "2025-03-12", color: "#F4ECC8" },
  { start: "2025-03-12", end: "2025-03-12", color: "#D4E4F1" },
  { start: "2025-03-16", end: "2025-03-17", color: "#D4E4F1" },
  { start: "2025-03-16", end: "2025-03-17", color: "#D4E4F1" },
  { start: "2025-03-20", end: "2025-03-20", color: "#F4ECC8" },
  { start: "2025-03-24", end: "2025-03-26", color: "#CFD6C6" },
  { start: "2025-03-25", end: "2025-03-25", color: "#EEDBDF" },
  { start: "2025-03-30", end: "2025-03-30", color: "#D4E4F1" },
  { start: "2025-03-30", end: "2025-03-30", color: "#F4ECC8" },
  { start: "2025-03-30", end: "2025-03-30", color: "#DBD4DC" },
];

function formatKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function EventBars({ date }) {
  const key = formatKey(date);
  const dayEvents = eventData.filter((ev) => ev.start <= key && ev.end >= key);

  return (
    <div className="event-bars">
      {dayEvents.slice(0, 5).map((ev, i) => {
        const isStart = ev.start === key;
        const isEnd = ev.end === key;
        const isSingle = ev.start === ev.end;

        const style = {
          backgroundColor: ev.color,
          borderRadius: isSingle
            ? "4px"
            : isStart
              ? "4px 0 0 4px"
              : isEnd
                ? "0 4px 4px 0"
                : "0",
        };

        return <div key={i} className="event-bar" style={style} />;
      })}
    </div>
  );
}

export default function CalendarComponent({ onDateClick }) {
  const [value, setValue] = useState(new Date(2025, 2, 4));
  
  const handleChange = (date) => {
    setValue(date);
    onDateClick(date); // 날짜 클릭시 부모한테 전달
  };
  return (
    <div className="calendar-wrapper">
      <Calendar
        value={value}
        onChange={handleChange}
        locale="ko-KR"
        calendarType="gregory"
        formatMonthYear={(locale, date) => `${date.getMonth() + 1}월`}
        formatDay={(locale, date) => date.getDate()}
        formatShortWeekday={(locale, date) =>
          ["일", "월", "화", "수", "목", "금", "토"][date.getDay()]
        }
        tileContent={({ date, view }) =>
          view === "month" ? <EventBars date={date} /> : null
        }
        prevLabel={null}
        nextLabel={null}
        prev2Label={null}
        next2Label={null}
        showNavigation={true}
        navigationLabel={({ date }) => (
          <div className="nav-label">
            <span>{date.getMonth() + 1}월</span>
            <span className="chevron">∨</span>
          </div>
        )}
      />
    </div>
  );
}
