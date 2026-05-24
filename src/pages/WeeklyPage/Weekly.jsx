import React, { useState, useEffect } from 'react';
import Header from "../../components/Header/Header.jsx";
import styles from './Weekly.module.css';

// 현재 날짜를 기준으로 'n월 n주차' 문자열을 반환하는 헬퍼 함수
const getWeekOfMonth = (targetDate) => {
  const month = targetDate.getMonth() + 1;
  const date = targetDate.getDate();
  
  // 해당 월의 1일 날짜 및 요일 구하기
  const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)
  
  // (현재 일수 + 1일의 요일 인덱스) / 7 을 올림 처리하여 주차 계산
  const weekNumber = Math.ceil((date + firstDayWeekday) / 7);
  
  return `${month}월 ${weekNumber}주차`;
};

export default function Weekly() {
  const [currentWeekStr, setCurrentWeekStr] = useState("");
  const [days, setDays] = useState([]); // 동적 날짜 리스트 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState("");

  useEffect(() => {
    const today = new Date();
    
    // 1. n월 n주차 설정
    setCurrentWeekStr(getWeekOfMonth(today));

    // 2. 월~일요일 기준 이번 주 날짜 배열 생성
    const currentDayOfWeek = today.getDay(); 
    // getDay()는 일요일이 0이므로, 월요일 기준(-1)으로 보정 (일요일일 경우 -6)
    const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    const calculatedDays = [];
    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(monday);
      dateObj.setDate(monday.getDate() + i);

      const isToday = dateObj.toDateString() === today.toDateString();

      // 시각적 효과 부여: 오늘은 'active', 그 외 과거 날짜는 임의의 링 효과, 미래는 'normal'
      let type = 'normal';
      if (isToday) {
        type = 'active';
      } else if (i === 0) {
        type = 'ring-1';
      } else if (i === 1) {
        type = 'ring-2';
      } else if (i === 2) {
        type = 'ring-3';
      }

      calculatedDays.push({
        fullDate: dateObj, // 고유 키값 및 모달용 전체 날짜
        date: dateObj.getDate(), // 화면에 표시될 일(Day)
        type: type
      });
    }
    
    setDays(calculatedDays);
  }, []);

  const tasks = [
    { title: "식물에 물주기", color: "#B9C7B2" },
    { title: "선영이 만나기", color: "#D3CCD6" },
    { title: "영단어 외우기", color: "#F0E6BE" },
    { title: "유튜브 영상 편집", color: "#C6DBEA" },
    { title: "은행 업무", color: "#E6D2D4" }
  ];

  // 할 일 클릭 핸들러
  const handleTaskClick = (title) => {
    setSelectedTaskTitle(title);
    setIsModalOpen(true);
  };

  return (
    <>
      <Header />
      <div className={styles['weekly-root']}>
        <div className={styles['frame-187']}>

          <main className={styles.main}>
            
            {/* Weekly Calendar Strip */}
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
                {days.map((day, index) => (
                  // 고유 키로 인덱스 또는 fullDate 사용
                  <div key={index} className={styles['day-wrapper']}>
                    <div className={`${styles['day-bg']} ${styles[day.type]}`}></div>
                    <span className={`${styles.day} ${day.type === 'active' ? styles['day-highlight'] : ''}`}>
                      {day.date}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Task List Container */}
            <section className={styles['task-container']}>
              <div className={styles['task-header']}>
                <h2 className={styles['week-title']}>{currentWeekStr}</h2>
                <div className={styles['task-header-icons']}>
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 1H18M0 7H12M0 13H6" stroke="black" strokeWidth="2"/>
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0V14M0 7H14" stroke="black" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              
              <div className={styles['task-list']}>
                {tasks.map((task, index) => (
                  <div 
                    key={index} 
                    className={styles['task-item']} 
                    onClick={() => handleTaskClick(task.title)}
                  >
                    <span className={styles['task-text']}>{task.title}</span>
                    <div 
                      className={styles['task-dot']} 
                      style={{ backgroundColor: task.color }}
                    ></div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>

        {/* --- Modal 오버레이 영역 --- */}
        {isModalOpen && (
          <div className={styles['modal-overlay']} onClick={() => setIsModalOpen(false)}>
            <div className={styles['modal-container']} onClick={(e) => e.stopPropagation()}>
              
              <div className={styles['modal-top']}>
                <div className={styles['modal-title-row']}>
                  <div className={styles['modal-category']}>
                    <div className={styles['modal-category-dot']}></div>
                    <span>집안일</span>
                  </div>
                  <h3 className={styles['modal-task-title']}>{selectedTaskTitle}</h3>
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
                <div className={styles['modal-info-row']}>
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 0C2.68629 0 0 2.68629 0 6C0 10.5 6 14 6 14C6 14 12 10.5 12 6C12 2.68629 9.31371 0 6 0ZM6 8.5C4.61929 8.5 3.5 7.38071 3.5 6C3.5 4.61929 4.61929 3.5 6 3.5C7.38071 3.5 8.5 4.61929 8.5 6C8.5 7.38071 7.38071 8.5 6 8.5Z" fill="#4C4C4C"/>
                  </svg>
                  <span>집</span>
                </div>
                <div className={styles['modal-info-row']}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="2" width="10" height="9" rx="1" stroke="#4C4C4C" strokeWidth="1.2"/>
                    <path d="M3 0V4M9 0V4M1 5H11" stroke="#4C4C4C" strokeWidth="1.2"/>
                  </svg>
                  <span>{new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              <div className={styles['modal-memo-box']}>
                {selectedTaskTitle} 관련 메모 내용
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}