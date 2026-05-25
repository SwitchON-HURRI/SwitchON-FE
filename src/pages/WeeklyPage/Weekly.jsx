import React, { useState, useEffect } from 'react';
import Header from "../../components/Header/Header.jsx";
import styles from './Weekly.module.css';

// 현재 날짜를 기준으로 'n월 n주차' 문자열을 반환하는 헬퍼 함수
const getWeekOfMonth = (targetDate) => {
  const month = targetDate.getMonth() + 1;
  const date = targetDate.getDate();
  
  const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); 
  
  const weekNumber = Math.ceil((date + firstDayWeekday) / 7);
  return `${month}월 ${weekNumber}주차`;
};

// YYYY-MM-DD 포맷 변환 헬퍼 함수
const formatYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// --- Mock Data ---
const mockSchedules = [
  {
    scheduleId: 10, userId: 1, categoryId: 1,
    title: "자료 조사", memo: "발표 자료 찾기", location: "카페",
    scheduleType: "FIXED", scheduledDate: formatYYYYMMDD(new Date()), // 오늘
    startTime: "10:00:00", endTime: "12:00:00", isCompleted: false
  },
  {
    scheduleId: 11, userId: 1, categoryId: 2,
    title: "팀 회의", memo: "프로젝트 진행 상황 공유", location: "회의실",
    scheduleType: "FIXED", scheduledDate: formatYYYYMMDD(new Date(Date.now() - 86400000)), // 어제
    startTime: "14:00:00", endTime: "15:00:00", isCompleted: true
  },
  {
    scheduleId: 12, userId: 1, categoryId: 3,
    title: "기획안 작성", memo: "", location: "집",
    scheduleType: "FIXED", scheduledDate: formatYYYYMMDD(new Date(Date.now() - 86400000)), // 어제
    startTime: "16:00:00", endTime: "18:00:00", isCompleted: false
  }
];

const mockCategories = [
  { categoryId: 1, categoryName: "공부", categoryColor: "#4CAF50" },
  { categoryId: 2, categoryName: "운동", categoryColor: "#FF9800" },
  { categoryId: 3, categoryName: "집안일", categoryColor: "#B9C7B2" }
];

export default function Weekly() {
  const [currentWeekStr, setCurrentWeekStr] = useState("");
  const [days, setDays] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [categories, setCategories] = useState([]); // 카테고리 상태 추가
  
  // Task 상세 모달 상태
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});

  // 필터 모달 상태
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("마감 임박순"); 

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 초기화
    setCurrentWeekStr(getWeekOfMonth(today));

    const currentDayOfWeek = today.getDay(); 
    const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDateStr = formatYYYYMMDD(monday);
    const endDateStr = formatYYYYMMDD(sunday);

    // 날짜 배열 세팅
    const calculatedDays = [];
    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(monday);
      dateObj.setDate(monday.getDate() + i);
      calculatedDays.push({
        fullDateObj: dateObj,
        dateStr: formatYYYYMMDD(dateObj),
        date: dateObj.getDate(),
      });
    }
    setDays(calculatedDays);

    // 일정 및 카테고리 API 동시 호출 로직
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 1. 일정 전체 조회
      try {
        const scheduleRes = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/schedule/read/range?startDate=${startDateStr}&endDate=${endDateStr}`, {
          method: 'GET',
          headers
        });
        if (!scheduleRes.ok) throw new Error("Schedule API Network Error");
        const scheduleData = await scheduleRes.json();
        setSchedules(scheduleData || []);
      } catch (error) {
        console.error("Schedule API Fetch Failed, loading Mock Data", error);
        setSchedules(mockSchedules);
      }

      // 2. 카테고리 전체 조회
      try {
        const categoryRes = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/category/read`, {
          method: 'GET',
          headers
        });
        if (!categoryRes.ok) throw new Error("Category API Network Error");
        const categoryData = await categoryRes.json();
        setCategories(categoryData || []);
      } catch (error) {
        console.error("Category API Fetch Failed, loading Mock Data", error);
        setCategories(mockCategories);
      }
    };

    fetchData();
  }, []);

  // 카테고리 정보 매칭 헬퍼 함수
  const getCategoryInfo = (categoryId) => {
    const matchedCategory = categories.find(c => c.categoryId === categoryId);
    return matchedCategory || { categoryName: "미지정", categoryColor: "#C1C1C1" };
  };

  const handleTaskClick = (schedule) => {
    setSelectedTask(schedule);
    setIsTaskModalOpen(true);
  };

  const filterOptionsList = ['중요도순', '마감 임박순', '카테고리순'];
  
  // 선택된 필터 옵션에 따라 일정 배열을 정렬하는 로직
  const sortedSchedules = [...schedules].sort((a, b) => {
    if (filterOption === '중요도순') {
      const impA = a.importance ?? -1;
      const impB = b.importance ?? -1;
      if (impA !== impB) return impB - impA; 
      return a.scheduleId - b.scheduleId; 
    }

    if (filterOption === '마감 임박순') {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      
      if (a.scheduledDate !== b.scheduledDate) {
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      }
      
      const hasTimeA = a.startTime !== null && a.endTime !== null;
      const hasTimeB = b.startTime !== null && b.endTime !== null;
      
      if (hasTimeA && hasTimeB) {
        if (a.endTime !== b.endTime) return a.endTime.localeCompare(b.endTime);
      }
      if (hasTimeA && !hasTimeB) return -1; 
      if (!hasTimeA && hasTimeB) return 1;  
      
      return a.scheduleId - b.scheduleId; 
    }

    if (filterOption === '카테고리순') {
      if (a.categoryId !== b.categoryId) return a.categoryId - b.categoryId; 
      return a.scheduleId - b.scheduleId; 
    }

    return 0;
  });

  // 모달에 표시할 선택된 일정의 카테고리 정보
  const selectedCategoryInfo = getCategoryInfo(selectedTask.categoryId);

  return (
    <>
      <Header />
      <div className={styles['weekly-root']}>
        <div className={styles['frame-187']}>

          <main className={styles.main}>
            
            <section className={styles['calendar-strip']}>
              <div className={styles['calendar-header']}>
                <h2 className={styles['week-title']}>{currentWeekStr}</h2>
                <div className={styles['chevron-down-icon']}>
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L8 8L15 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <hr className={styles['calendar-divider']} />

              <div className={styles['days-row']}>
                {days.map((day, index) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  const isToday = day.fullDateObj.getTime() === today.getTime();
                  const isFuture = day.fullDateObj.getTime() > today.getTime();
                  
                  const daySchedules = schedules.filter(s => s.scheduledDate === day.dateStr);
                  const total = daySchedules.length;
                  const completed = daySchedules.filter(s => s.isCompleted).length;
                  const percentage = total > 0 ? (completed / total) * 100 : 0;

                  let ringStyle = {};
                  let typeClass = '';

                  if (isToday) {
                    typeClass = 'active'; 
                  } else if (isFuture || total === 0) {
                    typeClass = ''; 
                  } else {
                    ringStyle = {
                      background: `conic-gradient(#E4D5E6 ${percentage}%, transparent ${percentage}%)`,
                      borderRadius: '50%',
                      mask: 'radial-gradient(closest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
                      WebkitMask: 'radial-gradient(closest-side, transparent calc(100% - 3px), black calc(100% - 3px))'
                    };
                  }

                  return (
                    <div key={index} className={styles['day-wrapper']}>
                      <div 
                        className={`${styles['day-bg']} ${typeClass ? styles[typeClass] : ''}`}
                        style={ringStyle}
                      ></div>
                      <span className={`${styles.day} ${typeClass === 'active' ? styles['day-highlight'] : ''}`}>
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={styles['task-container']}>
              <div className={styles['task-header']}>
                <h2 className={styles['week-title']}>{currentWeekStr}</h2>
                <div className={styles['task-header-icons']}>
                  <svg 
                    width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setIsFilterModalOpen(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    <path d="M0 1H18M0 7H12M0 13H6" stroke="black" strokeWidth="2"/>
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0V14M0 7H14" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              
              <div className={styles['task-list']}>
                {sortedSchedules.map((schedule) => {
                  const categoryInfo = getCategoryInfo(schedule.categoryId);
                  
                  return (
                    <div 
                      key={schedule.scheduleId} 
                      className={styles['task-item']} 
                      onClick={() => handleTaskClick(schedule)}
                    >
                      <span className={styles['task-text']}>{schedule.title}</span>
                      <div 
                        className={styles['task-dot']} 
                        style={{ backgroundColor: categoryInfo.categoryColor }}
                      ></div>
                    </div>
                  )
                })}
                {sortedSchedules.length === 0 && (
                  <div style={{fontSize: '12px', color: '#A5A5A5', textAlign: 'center', marginTop: '10px'}}>
                    이번 주 일정이 없습니다.
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>

        {/* --- 1. 할일 상세 모달 (Task Modal) --- */}
        {isTaskModalOpen && (
          <div className={styles['modal-overlay']} onClick={() => setIsTaskModalOpen(false)}>
            <div 
              className={styles['modal-container']} 
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: selectedCategoryInfo.categoryColor }}
            >
              <div className={styles['modal-top']}>
                <div className={styles['modal-title-row']}>
                  <div className={styles['modal-category']}>
                    <div 
                      className={styles['modal-category-dot']}
                      style={{ backgroundColor: selectedCategoryInfo.categoryColor }}
                    ></div>
                    <span>{selectedCategoryInfo.categoryName}</span>
                  </div>
                  <h3 className={styles['modal-task-title']}>{selectedTask.title}</h3>
                </div>

                <div className={styles['modal-progress-dots']}>
                  <div className={styles['progress-dot-dark']}></div>
                  <div className={styles['progress-dot-dark']}></div>
                  <div className={styles['progress-dot-dark']}></div>
                  <div className={styles['progress-dot-dark']}></div>
                  <div className={styles['progress-dot-light']}></div>
                </div>

                <span className={styles['modal-edit-text']}>일정 수정</span>
              </div>

              <button className={styles['modal-add-btn']}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 0V10M0 5H10" stroke="#4C4C4C" strokeWidth="1.5"/>
                </svg>
                <span>오늘 일정에 추가</span>
              </button>

              <div className={styles['modal-info-list']}>
                {selectedTask.location && (
                  <div className={styles['modal-info-row']}>
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 0C2.68629 0 0 2.68629 0 6C0 10.5 6 14 6 14C6 14 12 10.5 12 6C12 2.68629 9.31371 0 6 0ZM6 8.5C4.61929 8.5 3.5 7.38071 3.5 6C3.5 4.61929 4.61929 3.5 6 3.5C7.38071 3.5 8.5 4.61929 8.5 6C8.5 7.38071 7.38071 8.5 6 8.5Z" fill="#4C4C4C"/>
                    </svg>
                    <span>{selectedTask.location}</span>
                  </div>
                )}
                <div className={styles['modal-info-row']}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="2" width="10" height="9" rx="1" stroke="#4C4C4C" strokeWidth="1.2"/>
                    <path d="M3 0V4M9 0V4M1 5H11" stroke="#4C4C4C" strokeWidth="1.2"/>
                  </svg>
                  <span>{selectedTask.scheduledDate} {selectedTask.startTime && `| ${selectedTask.startTime.slice(0,5)}`}</span>
                </div>
              </div>

              <div className={styles['modal-memo-box']}>
                {selectedTask.memo || "메모가 없습니다."}
              </div>
            </div>
          </div>
        )}

        {/* --- 2. 하단 필터 모달 (Filter Bottom Sheet) --- */}
        {isFilterModalOpen && (
          <div className={styles['filter-overlay']} onClick={() => setIsFilterModalOpen(false)}>
            <div className={styles['filter-bottom-sheet']} onClick={(e) => e.stopPropagation()}>
              
              <div className={styles['filter-drag-handle']}></div>
              
              <div className={styles['filter-content']}>
                <div className={styles['filter-title']}>일정 필터</div>
                
                <div className={styles['filter-section']}>
                  <div className={styles['filter-subtitle']}>정렬</div>
                  
                  <div className={styles['filter-options']}>
                    {filterOptionsList.map(option => (
                      <div 
                        key={option} 
                        className={styles['filter-option-row']}
                        onClick={() => setFilterOption(option)}
                      >
                        <div className={`${styles['radio-btn']} ${filterOption === option ? styles['radio-active'] : ''}`}>
                          {filterOption === option && <div className={styles['radio-inner']}></div>}
                        </div>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles['filter-action-buttons']}>
                <button 
                  className={styles['filter-btn-cancel']} 
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  취소
                </button>
                <button 
                  className={styles['filter-btn-select']} 
                  onClick={() => {
                    setIsFilterModalOpen(false);
                  }}
                >
                  선택
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}