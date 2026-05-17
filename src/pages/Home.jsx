import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';
import { db } from '../firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const Home = () => {
  const [settings, setSettings] = useState({ 
    brandName: '다인이벤트',
    topLabel: 'PREMIUM DINING EXPERIENCE',
    title: '특별한 미식 축제에 초대합니다', 
    subtitle: '최고급 식재료와 셰프의 장인정신이 깃든 시즌 메뉴를 지금 바로 만나보세요.',
    heroImage: ''
  });
  
  const [activeNotices, setActiveNotices] = useState([]);
  const [showNoticePopup, setShowNoticePopup] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false); // [NEW] 체크박스 상태 추가

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const homeDoc = await getDoc(doc(db, 'settings', 'home'));
        if (homeDoc.exists()) {
          const data = homeDoc.data();
          setSettings(prev => ({
            ...prev,
            brandName: data.brandName || prev.brandName,
            topLabel: data.topLabel || prev.topLabel,
            title: data.title || prev.title,
            subtitle: data.subtitle || prev.subtitle,
            heroImage: data.heroImage || ''
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHome();

    // 2. 공지사항 실시간 구독 (onSnapshot 사용으로 삭제/수정 즉시 반영)
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // 오늘 날짜 기준 활성 공지 필터링
      const now = new Date();
      const active = allNotices.filter(n => {
        const start = new Date(n.startDate);
        const end = new Date(n.endDate);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return now >= start && now <= end;
      });
      
      // 고정(isPinned) 항목 우선 정렬
      const sorted = active.sort((a, b) => {
        if (b.isPinned !== a.isPinned) return b.isPinned ? 1 : -1;
        return 0;
      });
      
      setActiveNotices(sorted);
      
      // [MOD] 오늘 하루 보지 않기 체크 로직 추가
      const hideUntil = localStorage.getItem('hideNoticeUntil');
      const today = new Date().toLocaleDateString();
      
      if (sorted.length > 0 && hideUntil !== today) {
        setShowNoticePopup(true);
      } else {
        setShowNoticePopup(false);
      }
    }, (error) => {
      console.error("Notice fetch error:", error);
    });

    return () => unsubscribe();
  }, []);

  const displayImage = settings.heroImage || heroImg;

  // [NEW] 확인 버튼 클릭 핸들러
  const handleNoticeConfirm = () => {
    if (dontShowToday) {
      const today = new Date().toLocaleDateString();
      localStorage.setItem('hideNoticeUntil', today);
    }
    setShowNoticePopup(false);
  };

  return (
    <header className="hero" style={{ 
      backgroundImage: `url(${displayImage})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 1rem'
    }}>
      <div className="hero-overlay"></div>
      <div className="hero-content container" style={{ width: '100%', maxWidth: '100vw', padding: '0 0.5rem' }}>
        
        {/* 상단 라벨: 모바일에서 너무 길어지지 않게 조정 */}
        <span className="fade-in" style={{ 
          color: 'var(--primary)', 
          fontWeight: '600', 
          letterSpacing: 'clamp(2px, 1.5vw, 6px)', 
          fontSize: 'clamp(0.7rem, 2vw, 0.9rem)', 
          marginBottom: '1rem', 
          display: 'block',
          textShadow: '0 0 10px rgba(197, 160, 89, 0.5)' 
        }}>
          {settings.topLabel}
        </span>

        {/* 1. 식당 이름: 좁은 화면에서도 넘치지 않도록 clamp 적용 */}
        <div className="fade-in" style={{ marginBottom: '1rem' }}>
          <h2 style={{ 
            fontSize: 'clamp(2.2rem, 12vw, 5.5rem)', 
            fontWeight: '900', 
            color: '#fff', 
            margin: 0, 
            lineHeight: 1.1, 
            letterSpacing: '-1px',
            textTransform: 'uppercase',
            background: 'linear-gradient(to bottom, #ffffff 40%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
            wordBreak: 'keep-all'
          }}>
            {settings.brandName}
          </h2>
        </div>

        {/* 2. 대제목 및 소제목: 모바일 가독성 최적화 */}
        <h1 className="hero-title fade-in" style={{ 
          fontSize: 'clamp(1.4rem, 6vw, 2.8rem)', 
          marginTop: '0.8rem',
          lineHeight: '1.3',
          wordBreak: 'keep-all'
        }}>
          {settings.title}
        </h1>
        <p className="hero-subtitle fade-in" style={{ 
          fontSize: 'clamp(0.85rem, 3vw, 1.1rem)', 
          maxWidth: '500px', 
          margin: '1rem auto 2.5rem',
          lineHeight: '1.6',
          opacity: 0.9,
          padding: '0 1rem'
        }}>
          {settings.subtitle}
        </p>
        
        <div className="fade-in">
          <Link to="/event" className="btn-primary" style={{ 
            textDecoration: 'none', 
            display: 'inline-block', 
            padding: 'clamp(0.9rem, 3vw, 1.4rem) clamp(2.5rem, 8vw, 5rem)', 
            fontSize: 'clamp(1rem, 3vw, 1.2rem)', 
            borderRadius: '50px',
            boxShadow: '0 0 50px rgba(255, 215, 0, 0.4)'
          }}>
            이벤트 참여하기 ✨
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeInUp 1.2s ease-out forwards; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popupScaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 400px) {
          .hero-content { padding-top: 2rem; }
        }
      `}} />
      
      {/* ── 사용자 공지사항 팝업 ── */}
      {showNoticePopup && activeNotices.length > 0 && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowNoticePopup(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0d0d0d', border: '1px solid rgba(197, 160, 89, 0.4)',
              borderRadius: '20px', width: '100%', maxWidth: '400px',
              maxHeight: '80vh', overflowY: 'auto', padding: '1.5rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)', position: 'relative',
              animation: 'popupScaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {/* 닫기 버튼 */}
            <button 
              onClick={() => setShowNoticePopup(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                width: '30px', height: '30px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1.2rem', zIndex: 10
              }}
            >
              ✕
            </button>
            
            <h3 style={{ 
              color: 'var(--primary)', textAlign: 'center', marginTop: '0.5rem', marginBottom: '1.5rem', 
              fontSize: '1.3rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
            }}>
              <span>📢</span> 공지사항
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {activeNotices.map((notice, idx) => (
                <div key={notice.id} style={{ 
                  background: 'rgba(255,255,255,0.03)', padding: '1.2rem', 
                  borderRadius: '12px', borderLeft: notice.isPinned ? '3px solid var(--primary)' : '3px solid transparent'
                }}>
                  {notice.isPinned && (
                    <span style={{ 
                      display: 'inline-block', background: 'var(--primary)', color: '#000', 
                      fontSize: '0.65rem', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', marginBottom: '8px'
                    }}>
                      고정
                    </span>
                  )}
                  {/* 공지 내용만 표시 (기간 제외) */}
                  <p style={{ 
                    color: '#fff', fontSize: '0.95rem', lineHeight: '1.6', 
                    margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' 
                  }}>
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
            
            {/* [NEW] 오늘 하루 보지 않기 체크박스 영역 */}
            <div 
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                gap: '10px', marginTop: '1.2rem', cursor: 'pointer', userSelect: 'none' 
              }}
              onClick={() => setDontShowToday(!dontShowToday)}
            >
              <div style={{
                width: '18px', height: '18px', border: '1px solid #444', 
                borderRadius: '4px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', background: dontShowToday ? 'var(--primary)' : 'transparent',
                transition: 'all 0.2s', boxShadow: dontShowToday ? '0 0 10px rgba(197, 160, 89, 0.4)' : 'none'
              }}>
                {dontShowToday && <span style={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
              </div>
              <span style={{ color: '#888', fontSize: '0.85rem' }}>오늘 하루 보지 않기</span>
            </div>
            
            <button 
              onClick={handleNoticeConfirm}
              style={{
                width: '100%', padding: '1rem', marginTop: '1rem',
                background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)',
                color: '#000', border: 'none', borderRadius: '12px',
                fontWeight: '900', fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(248, 181, 0, 0.3)'
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Home;
