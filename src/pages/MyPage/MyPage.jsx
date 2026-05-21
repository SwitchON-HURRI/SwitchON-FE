import Header from "../../components/Header/Header.jsx";

import styles from './MyPage.module.css';

const MyPage = () => {
  // 카테고리 데이터
  const categories = [
    { id: 1, name: '집안일', color: '#F4C4C9' },
    { id: 2, name: '회사', color: '#D4E8B5' },
    { id: 3, name: '식단', color: '#97A9DE' },
    { id: 4, name: '운동', color: '#F4D485' },
    { id: 5, name: '공부', color: '#D9D9D9' },
  ];

  return (
    <div className={styles['mobile-wrapper']}>
      <div className={styles['mobile-container']}>
        
        {/* 헤더 (GNB & 페이지 타이틀) */}
        <header className={styles['header-section']}>
          <div className={styles.gnb}>
            <h1 className={styles.logo}>SWITCHON</h1>
            <div className={styles['header-icons']}>
              {/* 알림 */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              {/* 마이페이지/유저 */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {/* 더보기 */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </div>
          </div>

          <div className={styles['page-title-bar']}>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#A6A6A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L1 7L7 13"/></svg>
            <span className={styles['page-title']}>my page</span>
          </div>
        </header>

        <main className={styles['main-content']}>
          
          {/* 주간 요약 섹션 */}
          <section className={styles.section}>
            <h2 className={styles['section-title']}>주간 요약</h2>
            <div className={`${styles.card} ${styles['summary-card']}`}>
              
              {/* 이번 주 컨디션 */}
              <div className={`${styles['summary-block']} ${styles['condition-block']}`}>
                <h3 className={styles['block-title']}>이번 주 컨디션</h3>
                <div className={styles['condition-visual']}>
                  <div className={styles['condition-pills']}>
                    <div className={`${styles.pill} ${styles['pill-regular']}`}>Regular</div>
                    <div className={`${styles.pill} ${styles['pill-comfort']}`}>Comfort</div>
                    <div className={`${styles.pill} ${styles['pill-hard']}`}>Hard</div>
                  </div>
                  <div className={styles['condition-counts']}>
                    <div className={styles['count-circle']}>2회</div>
                    <div className={styles['count-circle']}>3회</div>
                    <div className={styles['count-circle']}>1회</div>
                  </div>
                </div>
              </div>

              {/* 스위치 켜진 횟수 */}
              <div className={`${styles['summary-block']} ${styles['switch-block']}`}>
                <h3 className={styles['block-title']}>이번 주 스위치가 얼마나 켜졌나요?</h3>
                <div className={styles['dot-indicators']}>
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={`switch-${i}`} 
                      className={`${styles.dot} ${i === 4 ? styles['dot-active'] : styles['dot-inactive']}`} 
                    />
                  ))}
                </div>
              </div>

              {/* 목표 달성률 */}
              <div className={`${styles['summary-block']} ${styles['goal-block']}`}>
                <h3 className={styles['block-title']}>이번 주 목표를 얼마나 달성했나요?</h3>
                <div className={styles['dot-indicators']}>
                  {[...Array(7)].map((_, i) => (
                    <div key={`goal-${i}`} className={`${styles.dot} ${styles['dot-inactive']}`} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 카테고리 편집 섹션 */}
          <section className={styles.section}>
            <h2 className={styles['section-title']}>카테고리 편집</h2>
            <div className={`${styles.card} ${styles['category-card']}`}>
              <h3 className={styles['block-title']}>카테고리 목록</h3>
              
              <div className={styles['category-list']}>
                {categories.map((cat) => (
                  <div key={cat.id} className={styles['category-item']}>
                    <div className={styles['category-info']}>
                      <span className={styles['color-dot']} style={{ backgroundColor: cat.color }}></span>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#A6A6A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                      <span className={styles['category-name']}>{cat.name}</span>
                    </div>
                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" stroke="#A6A6A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L6 6L11 1"/></svg>
                  </div>
                ))}
                
                {/* 카테고리 추가 버튼 */}
                <button className={styles['add-category-btn']}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#A6A6A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1V13M1 7H13"/></svg>
                  카테고리 추가
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default MyPage;