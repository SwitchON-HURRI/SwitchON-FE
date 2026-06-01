import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Setting.module.css';

export default function Setting() {
  const navigate = useNavigate();

  // --- 모달 상태 관리 ---
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // --- 리스트 아이템 클릭 핸들러 ---
  const handleItemClick = (menuName) => {
    if (menuName === '문의하기' || menuName === '탈퇴하기') {
      setIsContactModalOpen(true);
    } else {
      console.log(`${menuName} 버튼이 클릭되었습니다.`);
    }
  };

  // --- 🌟 로그아웃 API 연동 핸들러 ---
  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include' 
      });

      if (!response.ok) {
        throw new Error("Logout API Network Error");
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');

    } catch (error) {
      console.error("로그아웃 처리 중 오류 발생:", error);
      alert("로그아웃 처리 중 문제가 발생했습니다.");
    }
  };

  // --- 모달 버튼 핸들러 ---
  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://www.instagram.com/hurri.official');
      alert('인스타그램 링크가 클립보드에 복사되었습니다.');
      setIsContactModalOpen(false); // 복사 후 모달 닫기
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      alert('링크 복사에 실패했습니다.');
    }
  };

  // --- 네비게이션 라우트 연결 ---
  const handleNotificationClick = () => navigate("/notice");
  const handleProfileClick = () => navigate("/mypage");
  const handleMoreClick = () => navigate("/setting");

  return (
    <div className={styles['mobile-wrapper']}>
      <div className={styles['mobile-container']}>
        
        {/* 상단 GNB 헤더 영역 */}
        <header className={styles['header-section']}>
          <div className={styles.gnb}>
            <h1 className={styles.logo}>SWITCHON</h1>
            <div className={styles['header-icons']}>
              <svg onClick={handleNotificationClick} style={{cursor: 'pointer'}} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <svg onClick={handleProfileClick} style={{cursor: 'pointer'}} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <svg onClick={handleMoreClick} style={{cursor: 'pointer'}} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </div>
          </div>
        </header>

        <main className={styles['main-content']}>
          {/* 뒤로가기 및 페이지 타이틀 바 */}
          <div className={styles['page-title-bar']}>
            <svg 
              onClick={() => navigate(-1)} 
              style={{ cursor: 'pointer' }} 
              width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#A6A6A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M7 1L1 7L7 13" />
            </svg>
            <span className={styles['page-title']}>setting</span>
          </div>

          {/* 설정 메뉴 섹션 */}
          <section className={styles.section}>
            <h2 className={styles['section-title']}>로그인 정보</h2>
            
            <div className={styles.card}>
              <ul className={styles['setting-list']}>
                <li className={styles['setting-item']} onClick={() => handleItemClick('정보수정')}>
                  정보수정
                </li>
                <li className={styles['setting-item']} onClick={handleLogout}>
                  로그아웃
                </li>
                <li className={styles['setting-item']} onClick={() => handleItemClick('문의하기')}>
                  문의하기
                </li>
                <li className={styles['setting-item']} onClick={() => handleItemClick('탈퇴하기')}>
                  탈퇴하기
                </li>
              </ul>
            </div>
          </section>

        </main>
      </div>

      {/* --- 🌟 문의하기/탈퇴하기 모달 (전체 화면 Overlay) --- */}
      {isContactModalOpen && (
        <div className={styles['modal-overlay']} onClick={handleCloseModal}>
          <div 
            className={styles['modal-container']} 
            onClick={(e) => e.stopPropagation()} 
          >
            <p className={styles['modal-title']}>
              인스타그램 hurri.official<br />문의 부탁드립니다.
            </p>
            <div className={styles['modal-btn-row']}>
              <button className={styles['confirm-btn']} onClick={handleCopyLink}>
                링크복사
              </button>
              <button className={styles['cancel-btn']} onClick={handleCloseModal}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}