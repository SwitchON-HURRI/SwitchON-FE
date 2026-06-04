import { useState, useEffect, useMemo, useCallback } from "react";
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

function EventBars({ date, eventMap }) {
  const key = formatKey(date);
  const dayEvents = eventMap[key] || [];

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

export default function CalendarComponent({ onDateClick, refreshKey }) {
  const [value, setValue] = useState(new Date());
  const [eventData, setEventData] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [activeDate, setActiveDate] = useState(new Date());

  // 가공된 이벤트 맵 객체 생성 캐싱
  const eventMap = useMemo(() => {
    const map = {};
    eventData.forEach((ev) => {
      if (!map[ev.start]) map[ev.start] = [];
      map[ev.start].push(ev);
    });
    return map;
  }, [eventData]);

  // 카테고리 fetch (최초 마운트 시 1회 실행)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`${BASE_URL}/category/read`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });
        if (!res.ok) return;

        const data = await res.json();
        const map = {};
        data.forEach((c) => {
          map[c.categoryId] = c.categoryColor;
        });
        setCategoryMap(map);
      } catch (err) {
        console.error("카테고리 로드 실패:", err);
      }
    };
    fetchCategories();
  }, []);

  // useCallback으로 함수 재생성 방지
  const fetchMonthSchedules = useCallback(async (date, currentCategoryMap) => {
    try {
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
      if (!res.ok) return;
      const data = await res.json();

      const events = data.map((schedule) => ({
        start: schedule.scheduleDate,
        end: schedule.scheduleDate,
        // 인자로 전달받은 최신 맵으로 안전하게 매핑
        color: currentCategoryMap[schedule.categoryId] ?? "#cccccc",
      }));

      setEventData(events);
    } catch (err) {
      console.error("월별 일정 로드 실패:", err);
    }
  }, []);

  useEffect(() => {
    // categoryMap이 비어있지 않거나 로드가 끝난 시점, 혹은 달을 넘겼을 때 안전하게 호출
    fetchMonthSchedules(activeDate, categoryMap);
  }, [activeDate, refreshKey, categoryMap, fetchMonthSchedules]);

  const handleChange = (date) => {
    setValue(date);
    onDateClick(date);
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setActiveDate(activeStartDate);
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
            <EventBars date={date} eventMap={eventMap} />
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
