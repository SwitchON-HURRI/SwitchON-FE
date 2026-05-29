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

// --- [추가됨] HH:MM 포맷 변환 헬퍼 함수 (현재 시각 초기화용) ---
const formatHHMM = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
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

  // --- 일정 추가 모달 및 하위 모달 상태 ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  
  const [newSchedule, setNewSchedule] = useState({
    title: "", 
    categoryId: 1, 
    importance: 3, 
    date: formatYYYYMMDD(new Date()), 
    location: "", 
    time: formatHHMM(new Date()), 
    memo: ""
  });

  // --- [추가됨] 모달이 닫힐 때 데이터를 사용자의 요구사항대로 초기화하는 함수 ---
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    const now = new Date();
    setNewSchedule({
      title: "",
      categoryId: categories[0]?.categoryId || 1, // 목록 중 최상단 카테고리
      importance: 3,
      date: formatYYYYMMDD(now), // 오늘 날짜
      location: "",
      time: formatHHMM(now), // 현재 시각 (HH:MM)
      memo: ""
    });
  };

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
        
        // 카테고리 로드가 완료되면 초기 상태의 최상단 ID값 업데이트
        if (categoryData && categoryData.length > 0) {
          setNewSchedule(prev => ({ ...prev, categoryId: categoryData[0].categoryId }));
        }
      } catch (error) {
        console.error("Category API Fetch Failed, loading Mock Data", error);
        setCategories(mockCategories);
        setNewSchedule(prev => ({ ...prev, categoryId: mockCategories[0].categoryId }));
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
                  
                  {/* 필터 버튼 */}
                  <svg 
                    width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setIsFilterModalOpen(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x="0" y="0" width="20" height="3" rx="1.5" fill="black"/>
                    <rect x="4" y="6" width="12" height="3" rx="1.5" fill="black"/>
                    <rect x="7" y="12" width="6" height="3" rx="1.5" fill="black"/>
                  </svg>
                  
                  {/* 일정 추가 버튼 (+) */}
                  <svg 
                    width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setIsAddModalOpen(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    <path d="M12 4V20M4 12H20" stroke="black" strokeWidth="2" strokeLinecap="round"/>
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
                      <path d="M6 0C2.68629 0 0 2.68629 0 6C0 10.5 6 14 6 14C6 14 12 10.5 12 6C12 2.68629 9.31371 0 6 0ZM6 8.5C4.61929 8.5 3.5 7.38071 3.5 6C3.5 4.61929 4.61929 3.5 6 3.5 Regular" fill="#4C4C4C"/>
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

        {/* --- 3. 새 일정 추가 모달 --- */}
        {isAddModalOpen && (
          <div className={styles['add-overlay']} onClick={handleCloseAddModal}>
            <div className={styles['add-bottom-sheet']} onClick={(e) => e.stopPropagation()}>
              <div className={styles['add-content']}>
                <div className={styles['add-header']}>
                  <h2>일정 추가</h2>
                  <button className={styles['pin-btn']} onClick={() => setIsPinned(!isPinned)}>
                    {isPinned ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 14L18 16V18H13V22L12 24L11 22V18H6V16L8 14V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V14Z" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#4C4C4C" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 14L18 16V18H13V22L12 24L11 22V18H6V16L8 14V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V14Z"/>
                      </svg>
                    )}
                  </button>
                </div>

                <div className={styles['form-group-full']}>
                  <label>일정 이름</label>
                  <input 
                    type="text" 
                    placeholder="일정 이름을 입력하세요." 
                    className={styles['input-basic']}
                    value={newSchedule.title}
                    onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                  />
                </div>

                <div className={styles['form-row']}>
                  <div className={styles['form-group-half']}>
                    <label>카테고리</label>
                    <div className={styles['input-category']} onClick={() => setIsCategoryModalOpen(true)}>
                      <div className={styles['color-dot']} style={{backgroundColor: getCategoryInfo(newSchedule.categoryId).categoryColor}}></div>
                      <span>{getCategoryInfo(newSchedule.categoryId).categoryName}</span>
                    </div>
                  </div>
                  
                  <div className={styles['form-group-half']}>
                    <label>중요도</label>
                    <div className={styles['importance-dots']}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level} 
                          className={newSchedule.importance >= level ? styles['dot-dark'] : styles['dot-light']}
                          onClick={() => setNewSchedule({...newSchedule, importance: level})}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles['form-row']}>
                  <div className={styles['form-group-half']}>
                    <label>마감일</label>
                    {/* 수정됨: 꺽쇠 아이콘 포함 구조로 래핑 */}
                    <div className={styles['input-dropdown-wrapper']}>
                      <input 
                        type="date"
                        className={styles['input-select-dropdown']}
                        value={newSchedule.date}
                        onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                      />
                      <svg className={styles['dropdown-chevron']} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="#4C4C4C" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className={styles['form-group-half']}>
                    <label>장소</label>
                    <input 
                      type="text" 
                      placeholder="장소를 입력해주세요." 
                      className={styles['input-basic']}
                      value={newSchedule.location}
                      onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                    />
                  </div>
                </div>

                {!isPinned && (
                  <div className={styles['form-row']}>
                    <div className={styles['form-group-half']}>
                      <label>시간</label>
                      {/* 수정됨: 꺽쇠 아이콘 포함 구조로 래핑 */}
                      <div className={styles['input-dropdown-wrapper']}>
                        <input 
                          type="time"
                          step="300"
                          className={styles['input-select-dropdown']}
                          value={newSchedule.time}
                          onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                        />
                        <svg className={styles['dropdown-chevron']} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="#4C4C4C" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    
                    <div className={styles['form-group-half']}>
                      <label>메모</label>
                      <input 
                        type="text" 
                        placeholder={newSchedule.memo ? newSchedule.memo : "메모를 입력해주세요."} 
                        className={styles['input-basic']}
                        onClick={() => setIsMemoModalOpen(true)}
                        readOnly
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles['add-action-buttons']}>
                <button className={styles['add-btn-cancel']} onClick={handleCloseAddModal}>취소</button>
                <button className={styles['add-btn-select']} onClick={handleCloseAddModal}>추가</button>
              </div>
            </div>
          </div>
        )}

        {/* --- 4. 카테고리/메모 이너 모달 --- */}
        {isCategoryModalOpen && (
          <div className={styles['inner-modal-overlay']} onClick={() => setIsCategoryModalOpen(false)}>
            <div className={styles['category-modal-box']} onClick={(e) => e.stopPropagation()}>
              <div className={styles['inner-modal-header']} onClick={() => setIsCategoryModalOpen(false)}>
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 1L1 6L6 11" stroke="#8E8E8E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>카테고리 목록</span>
              </div>
              <div className={styles['category-list-wrapper']}>
                {categories.map((cat) => (
                  <div 
                    key={cat.categoryId} 
                    className={styles['category-item']}
                    onClick={() => {
                      setNewSchedule({...newSchedule, categoryId: cat.categoryId});
                      setIsCategoryModalOpen(false);
                    }}
                  >
                    <div className={styles['category-dot']} style={{backgroundColor: cat.categoryColor}}></div>
                    <span>{cat.categoryName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isMemoModalOpen && (
          <div className={styles['inner-modal-overlay']} onClick={() => setIsMemoModalOpen(false)}>
            <div className={styles['memo-modal-box']} onClick={(e) => e.stopPropagation()}>
              <div className={styles['inner-modal-header']} onClick={() => setIsMemoModalOpen(false)}>
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 1L1 6L6 11" stroke="#8E8E8E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>메모 입력</span>
              </div>
              
              <textarea 
                className={styles['memo-textarea']} 
                placeholder="메모를 입력해주세요."
                value={newSchedule.memo}
                onChange={(e) => setNewSchedule({...newSchedule, memo: e.target.value})}
              />
              
              <div className={styles['memo-action-area']}>
                <button className={styles['memo-add-btn']} onClick={() => setIsMemoModalOpen(false)}>추가</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}