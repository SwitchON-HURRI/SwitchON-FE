import React, { useState, useEffect, useRef } from 'react';
// import Header from "../../components/Header/Header.jsx";
import styles from './MyPage.module.css';

// 명세에 지정된 색상 Ellipse를 위한 임의의 팔레트 (상수 처리)
const COLOR_PALETTE = ['#F4C4C9', '#D4E8B5', '#97A9DE', '#F4D485', '#D9D9D9', '#F29481', '#CADAB6'];

const MyPage = () => {
  const [categories, setCategories] = useState([]);
  const [summaryData, setSummaryData] = useState({
    conditions: { regular: 0, comfort: 0, hard: 0 },
    switchDays: Array(7).fill(false),
    goalDays: Array(7).fill(false),
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- 카테고리 이름 편집 팝오버 관련 상태 ---
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [popoverStyle, setPopoverStyle] = useState({});
  const popoverRef = useRef(null);

  // --- 카테고리 색상 편집 팝오버 관련 상태 ---
  const [editingColorCategoryId, setEditingColorCategoryId] = useState(null);
  const [colorPopoverStyle, setColorPopoverStyle] = useState({});
  const colorPopoverRef = useRef(null);

  // --- 카테고리 추가 팝오버 관련 상태 ---
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [addPopoverStyle, setAddPopoverStyle] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const addPopoverRef = useRef(null);

  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        setIsLoading(true);
        const mockResponse = {
          categories: [
            { id: 1, name: '집안일', color: '#F4C4C9' },
            { id: 2, name: '회사', color: '#D4E8B5' },
            { id: 3, name: '식단', color: '#97A9DE' },
            { id: 4, name: '운동', color: '#F4D485' },
            { id: 5, name: '공부', color: '#D9D9D9' },
          ],
          summary: {
            conditions: { regular: 2, comfort: 3, hard: 1 },
            switchDays: [false, false, false, false, true, false, false], 
            goalDays: [false, false, false, false, false, false, false]
          }
        };
        setCategories(mockResponse.categories);
        setSummaryData(mockResponse.summary);
      } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPageData();
  }, []);

  // 외부 클릭 시 모든 팝오버 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 이름 변경 팝오버 닫기
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setEditingCategoryId(null);
      }
      // 색상 변경 팝오버 닫기
      if (colorPopoverRef.current && !colorPopoverRef.current.contains(event.target)) {
        setEditingColorCategoryId(null);
      }
      // 카테고리 추가 팝오버 닫기
      if (addPopoverRef.current && !addPopoverRef.current.contains(event.target)) {
        setIsAddPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // 모바일 터치 대응
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // --- 이벤트 핸들러 ---
  
  // 1. 이름 변경 팝오버 오픈
  const handleCategoryRowClick = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverHeight = 81; 
    const spaceBelow = window.innerHeight - rect.bottom;
    
    const top = spaceBelow > popoverHeight + 10 
      ? rect.bottom + 8 
      : rect.top - popoverHeight - 8;

    setPopoverStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${rect.left + (rect.width - 197) / 2}px`, 
      zIndex: 1000,
    });
    setEditingCategoryId(id);
    setEditingColorCategoryId(null); // 다른 팝오버는 닫기
    setIsAddPopoverOpen(false);
  };

  // 2. 색상 변경 팝오버 오픈
  const handleColorDotClick = (e, id) => {
    e.stopPropagation(); // 로우 클릭 이벤트로 전파 방지
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverHeight = 72; 
    const spaceBelow = window.innerHeight - rect.bottom;
    
    const top = spaceBelow > popoverHeight + 10 
      ? rect.bottom + 8 
      : rect.top - popoverHeight - 8;

    setColorPopoverStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${rect.left}px`, 
      zIndex: 1000,
    });
    
    setEditingColorCategoryId(id);
    setEditingCategoryId(null); // 다른 팝오버는 닫기
    setIsAddPopoverOpen(false);
  };

  // 3. 카테고리 추가 팝오버 오픈
  const handleAddCategory = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverHeight = 76; 
    
    // 버튼의 바로 위쪽에 화면 너비 기준 중앙 정렬로 배치
    setAddPopoverStyle({
      position: 'fixed',
      top: `${rect.top - popoverHeight - 8}px`,
      left: `50%`,
      transform: 'translateX(-50%)', 
      zIndex: 1000,
    });
    
    setIsAddPopoverOpen(true);
    setNewCategoryName('');
    
    setEditingCategoryId(null); // 다른 팝오버는 닫기
    setEditingColorCategoryId(null);
  };

  // 4. 이름 실시간 반영
  const handleNameChange = (e, id) => {
    const newName = e.target.value;
    setCategories((prev) => 
      prev.map(cat => cat.id === id ? { ...cat, name: newName } : cat)
    );
  };

  // 5. 색상 변경 반영
  const handleColorSelect = (id, newColor) => {
    setCategories((prev) => 
      prev.map(cat => cat.id === id ? { ...cat, color: newColor } : cat)
    );
    setEditingColorCategoryId(null); 
  };

  // 6. 새 카테고리 등록 처리 (엔터 키 입력 시 회색 고정 등록)
  const handleAddSubmit = (e) => {
    if (e.key === 'Enter') {
      if (newCategoryName.trim() === '') return; 

      // 고유 ID 생성을 위해 현재 리스트 중 최고 ID값 + 1 계산
      const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
      
      // 요청 스펙대로 우선은 기본 회색(#D9D9D9)으로 생성
      setCategories([...categories, { id: newId, name: newCategoryName, color: '#D9D9D9' }]);
      
      setIsAddPopoverOpen(false);
      setNewCategoryName('');
    }
  };

  const handleNotificationClick = () => console.log("알림 이동");
  const handleProfileClick = () => console.log("프로필 이동");
  const handleMoreClick = () => console.log("더보기 메뉴 오픈");

  if (isLoading) return <div className={styles['mobile-wrapper']} />;

  return (
    <div className={styles['mobile-wrapper']}>
      <div className={styles['mobile-container']}>
        
        <header className={styles['header-section']}>
          <div className={styles.gnb}>
            <h1 className={styles.logo}>SWITCHON</h1>
            <div className={styles['header-icons']}>
              <svg onClick={handleNotificationClick} style={{cursor: 'pointer'}} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <svg onClick={handleProfileClick} style={{cursor: 'pointer'}} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <svg onClick={handleMoreClick} style={{cursor: 'pointer'}} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </div>
          </div>

          <div className={styles['page-title-bar']}>
            <svg style={{cursor: 'pointer'}} width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#A6A6A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L1 7L7 13"/></svg>
            <span className={styles['page-title']}>my page</span>
          </div>
        </header>

        <main className={styles['main-content']}>
          
          <section className={styles.section}>
            <h2 className={styles['section-title']}>주간 요약</h2>
            <div className={`${styles.card} ${styles['summary-card']}`}>
              
              <div className={`${styles['summary-block']} ${styles['condition-block']}`}>
                <h3 className={styles['block-title']}>이번 주 컨디션</h3>
                <div className={styles['condition-visual']}>
                  <div className={styles['condition-pills']}>
                    <div className={`${styles.pill} ${styles['pill-regular']}`}>Regular</div>
                    <div className={`${styles.pill} ${styles['pill-comfort']}`}>Comfort</div>
                    <div className={`${styles.pill} ${styles['pill-hard']}`}>Hard</div>
                  </div>
                  <div className={styles['condition-counts']}>
                    <div className={styles['count-circle']}>{summaryData.conditions.regular}회</div>
                    <div className={styles['count-circle']}>{summaryData.conditions.comfort}회</div>
                    <div className={styles['count-circle']}>{summaryData.conditions.hard}회</div>
                  </div>
                </div>
              </div>

              <div className={`${styles['summary-block']} ${styles['switch-block']}`}>
                <h3 className={styles['block-title']}>이번 주 스위치가 얼마나 켜졌나요?</h3>
                <div className={styles['dot-indicators']}>
                  {summaryData.switchDays.map((isActive, i) => (
                    <div key={`switch-${i}`} className={`${styles.dot} ${isActive ? styles['dot-active'] : styles['dot-inactive']}`} />
                  ))}
                </div>
              </div>

              <div className={`${styles['summary-block']} ${styles['goal-block']}`}>
                <h3 className={styles['block-title']}>이번 주 목표를 얼마나 달성했나요?</h3>
                <div className={styles['dot-indicators']}>
                  {summaryData.goalDays.map((isActive, i) => (
                    <div key={`goal-${i}`} className={`${styles.dot} ${isActive ? styles['dot-active'] : styles['dot-inactive']}`} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles['section-title']}>카테고리 편집</h2>
            <div className={`${styles.card} ${styles['category-card']}`}>
              <h3 className={styles['block-title']}>카테고리 목록</h3>
              
              <div className={styles['category-list']}>
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className={styles['category-item']}
                    onClick={(e) => handleCategoryRowClick(e, cat.id)}
                    style={{cursor: 'pointer'}}
                  >
                    <div className={styles['category-info']}>
                      <span 
                        className={styles['color-dot']} 
                        style={{ backgroundColor: cat.color }}
                        onClick={(e) => handleColorDotClick(e, cat.id)}
                      ></span>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#A6A6A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                      <span className={styles['category-name']}>{cat.name}</span>
                    </div>
                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" stroke="#A6A6A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L6 6L11 1"/></svg>
                  </div>
                ))}
                
                <button className={styles['add-category-btn']} onClick={handleAddCategory}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#A6A6A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1V13M1 7H13"/></svg>
                  카테고리 추가
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* 1. 카테고리 이름 변경 팝오버 */}
      {editingCategoryId && (
        <div 
          ref={popoverRef}
          className={styles['edit-popover']} 
          style={popoverStyle}
        >
          <span className={styles['edit-title']}>카테고리 이름 변경</span>
          <div className={styles['edit-input-wrapper']}>
            <input 
              type="text" 
              className={styles['edit-input']} 
              placeholder="이름을 입력하세요"
              value={categories.find(c => c.id === editingCategoryId)?.name || ''}
              onChange={(e) => handleNameChange(e, editingCategoryId)}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* 2. 카테고리 색상 변경 팝오버 */}
      {editingColorCategoryId && (
        <div 
          ref={colorPopoverRef}
          className={styles['color-popover']} 
          style={colorPopoverStyle}
        >
          <span className={styles['edit-title']}>카테고리 색상 변경</span>
          <div className={styles['color-palette']}>
            {COLOR_PALETTE.map((color, idx) => (
              <div 
                key={`color-${idx}`} 
                className={styles['color-circle']} 
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(editingColorCategoryId, color)}
              />
            ))}
            <div className={styles['small-dots-wrapper']}>
              <div className={styles['small-dot']} />
              <div className={styles['small-dot']} />
              <div className={styles['small-dot']} />
            </div>
          </div>
        </div>
      )}

      {/* 3. 카테고리 추가 팝오버 */}
      {isAddPopoverOpen && (
        <div 
          ref={addPopoverRef}
          className={styles['add-popover']} 
          style={addPopoverStyle}
        >
          <span className={styles['add-title']}>카테고리 추가</span>
          <div className={styles['add-row']}>
            {/* 1. 좌측: 색상 동그라미 (순서 변경 및 이미지와 유사하게 SVG 수정) */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="6.5" stroke="#D7D7D7" strokeWidth="1"/>
              <circle cx="7" cy="7" r="3.5" fill="#A6A6A6"/>
            </svg>

            {/* 2. 우측: 입력창 (순서 변경) */}
            <div className={styles['add-input-wrapper']}>
              <input 
                type="text" 
                className={styles['add-input']} 
                placeholder="이름을 입력하세요"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={handleAddSubmit}
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyPage;