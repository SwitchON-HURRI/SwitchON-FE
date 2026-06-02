import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";

const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

function formatKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function EventBars({ date, eventData }) {
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
  const [value, setValue] = useState(new Date());
  const [eventData, setEventData] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});

  // 카테고리 fetch
  useEffect(() => {
    const fetchCategories = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/category/read`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const data = await res.json();
      const map = {};
      data.forEach((c) => {
        map[c.categoryId] = c.categoryColor;
      });
      setCategoryMap(map);
    };
    fetchCategories();
  }, []);

  // 월별 일정 fetch
  const fetchMonthSchedules = async (date) => {
    const accessToken = localStorage.getItem("accessToken");
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const startDate = `${y}-${m}-01`;
    const lastDay = new Date(y, date.getMonth() + 1, 0).getDate();
    const endDate = `${y}-${m}-${lastDay}`;

    const res = await fetch(
      `${BASE_URL}/schedule/read/range?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      },
    );
    const data = await res.json();

    const events = data.map((schedule) => ({
      start: schedule.scheduleDate,
      end: schedule.scheduleDate,
      color: categoryMap[schedule.categoryId] ?? "#cccccc",
    }));

    setEventData(events);
  };

  useEffect(() => {
    if (Object.keys(categoryMap).length > 0) {
      fetchMonthSchedules(value);
    }
  }, [categoryMap]);

  const handleChange = (date) => {
    setValue(date);
    onDateClick(date);
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    fetchMonthSchedules(activeStartDate);
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        value={value}
        onChange={handleChange}
        onActiveStartDateChange={handleActiveStartDateChange}
        locale="ko-KR"
        calendarType="gregory"
        formatMonthYear={(locale, date) => `${date.getMonth() + 1}월`}
        formatDay={(locale, date) => date.getDate()}
        formatShortWeekday={(locale, date) =>
          ["일", "월", "화", "수", "목", "금", "토"][date.getDay()]
        }
        tileContent={({ date, view }) =>
          view === "month" ? (
            <EventBars date={date} eventData={eventData} />
          ) : null
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
