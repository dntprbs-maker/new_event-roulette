import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useTenant } from '../context/TenantContext';

const NoticeBar = () => {
  const { getColRef } = useTenant();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveNotices = async () => {
      try {
        const todayStr = new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\. /g, '-').replace(/\./g, '');
        
        // [FIX] 복합 인덱스 불필요 - createdAt 단일 정렬 후 JS에서 isPinned 처리
        const q = query(
          getColRef('notices'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const allNotices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 오늘 날짜 기준 활성 공지 필터링 (startDate <= today <= endDate)
        const now = new Date();
        const active = allNotices.filter(n => {
          const start = new Date(n.startDate);
          const end = new Date(n.endDate);
          // 시간 정규화 (날짜만 비교)
          start.setHours(0,0,0,0);
          end.setHours(23,59,59,999);
          return now >= start && now <= end;
        });
        
        // 고정(isPinned) 항목을 먼저, 그 다음 최신순 정렬
        const sorted = active.sort((a, b) => {
          if (b.isPinned !== a.isPinned) return b.isPinned ? 1 : -1;
          return 0;
        });
        
        setNotices(sorted);
      } catch (err) {
        console.error("NoticeBar fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveNotices();
  }, []);

  if (loading || notices.length === 0) return null;

  return (
    <div className="notice-bar-wrapper">
      <div className="notice-bar-container">
        <div className="notice-label">
          <span className="notice-icon">📢</span>
          <span className="label-text">공지</span>
        </div>
        <div className="notice-content">
          <div className="notice-marquee-track">
            <div className="notice-marquee-content">
              {notices.map((notice, idx) => (
                <span key={notice.id} className="notice-item">
                  {notice.content}
                  {idx < notices.length - 1 && <span className="notice-divider">|</span>}
                </span>
              ))}
              {/* 무한 루프를 위해 내용 반복 */}
              {notices.length > 0 && (
                <span className="notice-spacer" style={{ display: 'inline-block', width: '50px' }}></span>
              )}
              {notices.map((notice, idx) => (
                <span key={`dup-${notice.id}`} className="notice-item">
                  {notice.content}
                  {idx < notices.length - 1 && <span className="notice-divider">|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .notice-bar-wrapper {
          position: fixed;
          top: 60px; /* Navbar 바로 아래 (Navbar 높이에 따라 조정 필요) */
          left: 0;
          width: 100%;
          z-index: 999;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(197, 160, 89, 0.2);
          height: 36px;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .notice-bar-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0 1rem;
          height: 100%;
        }

        .notice-label {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%);
          color: #000;
          padding: 3px 12px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 900;
          margin-right: 20px;
          flex-shrink: 0;
          box-shadow: 0 0 15px rgba(197, 160, 89, 0.4);
          letter-spacing: -0.5px;
        }

        .notice-content {
          flex: 1;
          overflow: hidden;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
        }

        .notice-marquee-track {
          display: flex;
          width: max-content;
          animation: notice-marquee 30s linear infinite;
        }

        .notice-marquee-content {
          display: flex;
          align-items: center;
          white-space: nowrap;
        }

        .notice-item {
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0 15px;
          display: flex;
          align-items: center;
          letter-spacing: -0.3px;
        }

        .notice-divider {
          color: var(--primary);
          margin-left: 25px;
          font-weight: 300;
          opacity: 0.6;
        }

        @keyframes notice-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Navbar 높이 대응을 위한 전역 스타일 조정이 필요할 수 있음 */
        @media (max-width: 768px) {
          .notice-bar-wrapper {
            top: 52px; /* 모바일 Navbar 높이에 맞춤 */
            height: 32px;
          }
          .notice-item {
            font-size: 0.75rem;
          }
          .notice-label {
            padding: 2px 10px;
            font-size: 0.65rem;
            margin-right: 12px;
          }
          .notice-label .label-text {
            display: none; /* 모바일에서는 아이콘만 표시하거나 텍스트 제거 */
          }
          .notice-label .notice-icon {
            margin: 0;
          }
        }
      `}} />
    </div>
  );
};

export default NoticeBar;
