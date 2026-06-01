import React, { useState, useEffect, useRef } from 'react';
// import Header from "../../components/Header/Header.jsx";
import { useNavigate } from 'react-router-dom';
import styles from './MyPage.module.css';

// 업데이트된 공통 색상 팔레트
const COLOR_PALETTE = ['#EEDBDF', '#F4ECC8', '#DADADC', '#D4E4F1', '#CFD6C6', '#DBD4DC', '#F2DBCD'];

const mockCategories = [
  { id: 1, name: '집안일', color: '#F4C4C9' },
  { id: 2, name: '회사', color: '#D4E8B5' },
  { id: 3, name: '식단', color: '#97A9DE' },
  { id: 4, name: '운동', color: '#F4D485' },
  { id: 5, name: '공부', color: '#D9D9D9' },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // --- [주간 요약 UI 용 상태] API 연동을 위해 초기값 0으로 세팅 ---
  const [weeklyCondition, setWeeklyCondition] = useState({
    regularCount: 1, 
    comfortCount: 3, 
    hardCount: 2,   
    totalCount: 6, 
    isError: false, 
  });

  const [summaryData, setSummaryData] = useState({
    switchDays: Array(7).fill(false),
    goalDays: Array(7).fill(false),
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- [카테고리 팝오버/모달 상태] ---
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [popoverStyle, setPopoverStyle] = useState({});
  const popoverRef = useRef(null);

  const [editingColorCategoryId, setEditingColorCategoryId] = useState(null);
  const [colorPopoverStyle, setColorPopoverStyle] = useState({});
  const colorPopoverRef = useRef(null);

  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [addPopoverStyle, setAddPopoverStyle] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_PALETTE[2]);
  const addPopoverRef = useRef(null);

  const [isAddColorPaletteOpen, setIsAddColorPaletteOpen] = useState(false);
  const addColorPaletteRef = useRef(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  // --- 데이터 패칭 ---
  useEffect(() => {
    const fetchMyPageData = async () => {
      setIsLoading(true);
      
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 1. 현재 사용자 조회
      try {
        const userRes = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/auth/me`, {
          method: 'GET',
          headers
        });
        
        if (!userRes.ok) {
          if (userRes.status === 401 || userRes.status === 403) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return;
          }
          throw new Error("User API Network Error");
        }
        
        const userData = await userRes.json();
        setUserInfo(userData);
      } catch (error) {
        console.error("User API Fetch Failed", error);
      }

      // 2. 카테고리 전체 조회
      try {
        const categoryRes = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/category/read`, {
          method: 'GET',
          headers
        });
        
        if (!categoryRes.ok) throw new Error("Category API Network Error");
        
        const categoryData = await categoryRes.json();
        const formattedCategories = categoryData.map(cat => ({
          id: cat.categoryId,
          name: cat.categoryName,
          color: cat.categoryColor,
        }));
        setCategories(formattedCategories || []);
      } catch (error) {
        console.error("Category API Fetch Failed, loading Mock Data", error);
        setCategories(mockCategories);
      }

      // 3. 주간 상태 집계 조회
      try {
        const stateRes = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/state/all/read`, {
          method: 'GET',
          headers
        });

        if (!stateRes.ok) throw new Error("State API Network Error");

        const stateData = await stateRes.json();
        setWeeklyCondition({
          regularCount: stateData.regularCount || 0,
          comfortCount: stateData.comfortCount || 0,
          hardCount: stateData.hardCount || 0,
          totalCount: stateData.totalCount || 0,
          isError: false,
        });
      } catch (error) {
        console.error("State API Fetch Failed", error);
        setWeeklyCondition(prev => ({ ...prev, isError: true }));
      }

      // TODO: 스위치 요약 데이터 API 연동 위치
      setSummaryData({
        switchDays: [false, false, false, false, true, false, false], 
        goalDays: [false, false, false, false, false, false, false]
      });

      setIsLoading(false);
    };

    fetchMyPageData();
  }, []);

  // 외부 클릭 시 모든 팝오버 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setEditingCategoryId(null);
      }
      if (colorPopoverRef.current && !colorPopoverRef.current.contains(event.target)) {
        setEditingColorCategoryId(null);
      }
      if (addPopoverRef.current && !addPopoverRef.current.contains(event.target)) {
        setIsAddPopoverOpen(false);
        setIsAddColorPaletteOpen(false);
      }
      if (addColorPaletteRef.current && !addColorPaletteRef.current.contains(event.target)) {
        setIsAddColorPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // --- 이벤트 핸들러 ---
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
    setEditingColorCategoryId(null);
    setIsAddPopoverOpen(false);
  };

  const handleColorDotClick = (e, id) => {
    e.stopPropagation();
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
    setEditingCategoryId(null);
    setIsAddPopoverOpen(false);
  };

  const handleAddCategory = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverHeight = 76; 
    
    setAddPopoverStyle({
      position: 'fixed',
      top: `${rect.top - popoverHeight - 8}px`,
      left: `50%`,
      transform: 'translateX(-50%)', 
      zIndex: 1000,
    });
    
    setIsAddPopoverOpen(true);
    setNewCategoryName('');
    setNewCategoryColor(COLOR_PALETTE[2]);
    setIsAddColorPaletteOpen(false);
    
    setEditingCategoryId(null);
    setEditingColorCategoryId(null);
  };

  const handleNameChange = (e, id) => {
    const newName = e.target.value;
    setCategories((prev) => 
      prev.map(cat => cat.id === id ? { ...cat, name: newName } : cat)
    );
  };

  const handleNameKeyDown = async (e, id, currentName) => {
    if (e.key === 'Enter') {
      setEditingCategoryId(null); 
      
      const token = localStorage.getItem('accessToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/category/update/name`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            categoryId: id,
            categoryName: currentName
          }),
        });
        
        if (!res.ok) throw new Error("Category Name Update API Network Error");
      } catch (error) {
        console.error('Category Name Update Failed', error);
      }
    }
  };

  const handleColorSelect = async (id, newColor) => {
    setCategories((prev) => 
      prev.map(cat => cat.id === id ? { ...cat, color: newColor } : cat)
    );
    setEditingColorCategoryId(null); 

    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/category/update/color`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categoryId: id,
          categoryColor: newColor
        }),
      });
      
      if (!res.ok) throw new Error("Category Color Update API Network Error");
    } catch (error) {
      console.error('Category Color Update Failed', error);
    }
  };

  const handleAddSubmit = async (e) => {
    if (e.key === 'Enter') {
      if (newCategoryName.trim() === '') return; 
      
      const token = localStorage.getItem('accessToken');
      
      try {
        const createRes = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/category/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            categoryName: newCategoryName,
            categoryColor: newCategoryColor
          }),
        });

        if (!createRes.ok) throw new Error("Category Create API Network Error");

        setIsAddPopoverOpen(false);
        setNewCategoryName('');
        setNewCategoryColor(COLOR_PALETTE[2]);

        const readRes = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/category/read`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (readRes.ok) {
          const categoryData = await readRes.json();
          const formattedCategories = categoryData.map(cat => ({
            id: cat.categoryId,
            name: cat.categoryName,
            color: cat.categoryColor,
          }));
          setCategories(formattedCategories || []);
        }

      } catch (error) {
        console.error('Category Creation or Fetch Failed', error);
      }
    }
  };

  const handleDeleteTrigger = (id) => {
    setDeletingCategoryId(id);
    setEditingCategoryId(null); 
  };

  const handleCancelDelete = () => {
    setDeletingCategoryId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategoryId) return;

    const token = localStorage.getItem('accessToken');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/category/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categoryId: deletingCategoryId
        })
      });

      if (!res.ok) throw new Error("Category Delete API Network Error");

      setCategories((prev) => prev.filter(cat => cat.id !== deletingCategoryId));
      setDeletingCategoryId(null);

    } catch (error) {
      console.error('Category Deletion Failed', error);
    }
  };

  const handleNotificationClick = () => console.log("알림 이동");
  const handleProfileClick = () => console.log("프로필 이동");
  const handleMoreClick = () => console.log("더보기 메뉴 오픈");

  // --- 컨디션 배치 계산 로직 ---
  const getConditionLayout = () => {
    const defaultData = {
      isDimmed: false,
      pills: [],
    };

    if (weeklyCondition.isError || weeklyCondition.totalCount === 0) {
      return { ...defaultData, isDimmed: true };
    }

    const items = [
      { id: 'regular', label: 'Regular', count: weeklyCondition.regularCount, baseClass: styles['pill-regular'], width: 92 },
      { id: 'comfort', label: 'Comfort', count: weeklyCondition.comfortCount, baseClass: styles['pill-comfort'], width: 118 },
      { id: 'hard', label: 'Hard', count: weeklyCondition.hardCount, baseClass: styles['pill-hard'], width: 88 },
    ];

    const priority = { regular: 3, comfort: 2, hard: 1 };
    const sorted = [...items].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return priority[b.id] - priority[a.id];
    });

    const locatedPills = [];
    const renderedItems = items.filter(item => item.count > 0);
    const areRenderedCountsEqual = renderedItems.length > 0 && renderedItems.every(item => item.count === renderedItems[0].count);

    const posTypes = ['center', 'right', 'left'];

    if (areRenderedCountsEqual) {
      const posStyles = [
        { left: '50%', transform: 'translateX(-50%)', zIndex: 2 },
        { right: 0, zIndex: 1 },
        { left: 0, zIndex: 1 },
      ];

      sorted.forEach((item, index) => {
        if (item.count === 0) return;
        locatedPills.push({ 
          ...item, 
          height: 56, 
          posStyle: posStyles[index],
          positionType: posTypes[index]
        });
      });
    } else {
      const countToHeightMap = { 3: 56, 2: 42, 1: 34 };
      
      sorted.forEach((item, index) => {
        if (item.count === 0) return;
        
        const dynamicHeight = countToHeightMap[item.count] || 34;
        let posStyle;
        
        if (index === 0) {
          posStyle = { left: '50%', transform: 'translateX(-50%)', zIndex: 2 };
        } else if (index === 1) {
          posStyle = { right: 0, zIndex: 1 };
        } else {
          posStyle = { left: 0, zIndex: 1 };
        }

        locatedPills.push({ 
          ...item, 
          height: dynamicHeight,
          posStyle,
          positionType: posTypes[index]
        });
      });
    }

    return { ...defaultData, pills: locatedPills };
  };

  const { isDimmed, pills } = getConditionLayout();

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
            <svg onClick={() => navigate(-1)} style={{cursor: 'pointer'}} width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#A6A6A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L1 7L7 13"/></svg>
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
                    {pills.map((pill) => (
                      <div 
                        key={`pill-${pill.id}`}
                        className={`${styles.pill} ${pill.baseClass}`}
                        style={{
                          width: `${pill.width}px`,   
                          height: `${pill.height}px`, 
                          ...pill.posStyle            
                        }}
                      >
                        {pill.label}
                      </div>
                    ))}
                  </div>

                  <div className={styles['condition-counts']}>
                    {['left', 'center', 'right'].map((pos) => {
                      const matchedPill = pills.find(p => p.positionType === pos);
                      return (
                        <div 
                          key={`count-${pos}`} 
                          className={styles['count-circle']}
                          style={{ visibility: matchedPill ? 'visible' : 'hidden' }}
                        >
                          {matchedPill ? `${matchedPill.count}회` : '0회'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isDimmed && (
                  <div className={styles['dim-overlay']}>
                    <span className={styles['dim-text']}>주간 상태를 수집중입니다.</span>
                  </div>
                )}
              </div>
{/*2차 MVP}
              <div className={`${styles['summary-block']} ${styles['switch-block']}`}>
                <h3 className={styles['block-title']}>이번 주 스위치가 얼마나 켜졌나요?</h3>
                <div className={styles['dot-indicators']}>
                  {summaryData.switchDays.map((isActive, i) => (
                    <div key={`switch-${i}`} className={`${styles.dot} ${isActive ? styles['dot-active'] : styles['dot-inactive']}`} />
                  ))}
                </div>
              </div> */}
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

      {/* --- 팝오버 및 모달 영역 --- */}

      {/* 1. 카테고리 이름 변경 팝오버 */}
      {editingCategoryId && (
        <div 
          ref={popoverRef}
          className={styles['edit-popover']} 
          style={popoverStyle}
        >
          <div className={styles['edit-title-row']}>
            <span className={styles['edit-title']}>카테고리 이름 변경</span>
            <span 
              className={styles['edit-delete-btn']} 
              onClick={() => handleDeleteTrigger(editingCategoryId)}
            >
              삭제
            </span>
          </div>
          {/* 🌟 기존 wrapper 제거하고 input에 직접 스타일 적용 🌟 */}
          <input 
            type="text" 
            className={styles['edit-input']} 
            placeholder="이름을 입력하세요"
            value={categories.find(c => c.id === editingCategoryId)?.name || ''}
            onChange={(e) => handleNameChange(e, editingCategoryId)}
            onKeyDown={(e) => handleNameKeyDown(e, editingCategoryId, categories.find(c => c.id === editingCategoryId)?.name)}
            autoFocus
          />
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
            
            <div className={styles['add-color-selector-wrapper']}>
              <svg 
                width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"
                onClick={() => setIsAddColorPaletteOpen(!isAddColorPaletteOpen)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="7" cy="7" r="6.5" stroke="#D7D7D7" strokeWidth="1"/>
                <circle cx="7" cy="7" r="4.5" fill={newCategoryColor}/>
              </svg>

              {isAddColorPaletteOpen && (
                <div ref={addColorPaletteRef} className={styles['add-color-palette-popover']}>
                  <div className={styles['color-palette-simple']}>
                    {COLOR_PALETTE.map((color, idx) => (
                      <div 
                        key={`add-new-color-${idx}`} 
                        className={styles['color-circle']} 
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setNewCategoryColor(color);
                          setIsAddColorPaletteOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 🌟 기존 wrapper 제거하고 input에 직접 스타일 적용 🌟 */}
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
      )}

      {/* 4. 카테고리 삭제 모달 (전체 화면 Overlay) */}
      {deletingCategoryId && (
        <div className={styles['delete-modal-overlay']} onClick={handleCancelDelete}>
          <div 
            className={styles['delete-modal-container']} 
            onClick={(e) => e.stopPropagation()} 
          >
            <span className={styles['delete-modal-title']}>카테고리를 삭제하시겠습니까?</span>
            <div className={styles['delete-btn-row']}>
              <button className={styles['cancel-btn']} onClick={handleCancelDelete}>
                취소
              </button>
              <button className={styles['confirm-delete-btn']} onClick={handleConfirmDelete}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}