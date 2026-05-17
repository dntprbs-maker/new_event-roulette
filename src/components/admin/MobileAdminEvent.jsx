import React, { useState } from 'react';

const MobileAdminEvent = ({ 
  prizes, handleChange, handleSave, 
  handleConfirmReset, saving, 
  showResetConfirm, setShowResetConfirm 
}) => {
  const [isSetupMode, setIsSetupMode] = useState(false);

  // 리스트 뷰 (초고광택 황금빛 버튼 반영 버전)
  if (!isSetupMode) {
    return (
      <div className="mobile-admin-container" style={{ padding: '0 0.8rem 150px 0.8rem', animation: 'fadeIn 0.5s ease-out' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {prizes.map((prize, index) => (
            <div key={index} className="slim-premium-card">
              <div className="card-top-row">
                <span className="gold-icon">🎁</span>
                <span className="prize-name-main text-ellipsis">{prize.name}</span>
              </div>
              <div className="card-bottom-row">
                <span className="stat-text">
                  설정: <span className="val">{prize.totalCount}</span> / 남은: <span className="val-gold">{prize.currentCount}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 주인님 지시: 더 밝고 그라데이션이 강렬한 리얼 골드 버튼 */}
        <div className="action-floating-dual-perfect">
          <button 
            className="mockup-btn-extreme-gold" 
            onClick={() => setIsSetupMode(true)}
          >
            <span className="btn-label">새 이벤트 만들기</span>
            <span className="btn-icon-right-thin">🔄</span>
          </button>
          <button 
            className="mockup-btn-extreme-gold" 
            onClick={() => handleSave()}
            disabled={saving}
          >
            <span className="btn-label">{saving ? '저장중' : '변경내용저장'}</span>
            <span className="btn-icon-right-thin">💾</span>
          </button>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .slim-premium-card {
            background: rgba(15, 15, 15, 0.7);
            border: 1px solid rgba(197, 160, 89, 0.25);
            border-radius: 10px;
            padding: 0.7rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 2px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            backdrop-filter: blur(8px);
          }
          .card-top-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
          .gold-icon { font-size: 0.9rem; opacity: 0.9; }
          .prize-name-main { color: #eee; font-size: 0.9rem; font-weight: 700; letter-spacing: -0.3px; }
          .text-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          
          .card-bottom-row { display: flex; align-items: center; }
          .stat-text { color: #666; font-size: 0.75rem; font-weight: 500; }
          .val { color: #aaa; font-weight: 600; margin: 0 2px; }
          .val-gold { color: var(--primary); font-weight: 800; margin: 0 2px; }

          /* 초고광택 리얼 골드 버튼 스타일 */
          .action-floating-dual-perfect { 
            position: fixed; bottom: 35px; left: 12px; right: 12px; 
            display: flex; gap: 12px; z-index: 2000; 
            animation: slideUpIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          }
          .mockup-btn-extreme-gold {
            flex: 1;
            padding: 0.9rem 0.5rem;
            border-radius: 12px;
            /* 다중 정지점 그라데이션으로 화사한 광택 구현 */
            background: linear-gradient(135deg, 
              #fceabb 0%, 
              #fccd4d 40%, 
              #f8b500 50%, 
              #fccd4d 60%, 
              #fbdf93 100%
            );
            border: 1px solid #ffeb3b; /* 미세한 밝은 테두리 */
            color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            /* 더욱 밝아진 골드 아우라 */
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4);
            transition: all 0.2s ease;
          }
          .btn-label { font-size: 0.85rem; font-weight: 900; letter-spacing: -0.5px; }
          .btn-icon-right-thin { font-size: 0.9rem; filter: drop-shadow(0 0 1px rgba(0,0,0,0.3)); }
          
          .mockup-btn-extreme-gold:active { 
            transform: scale(0.95); 
            filter: brightness(1.1); 
          }
          .mockup-btn-extreme-gold:disabled { opacity: 0.6; filter: grayscale(0.4); }

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUpIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        `}} />
      </div>
    );
  }

  // 초기화 및 설정 뷰 (동일한 고광택 버튼 적용)
  return (
    <div className="mobile-admin-container" style={{ padding: '0 1rem 150px 1rem', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: '900' }}>🔄 새 이벤트 만들기</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {prizes.map((prize, index) => (
          <div key={index} className="setup-slim-card-final">
            <div className="setup-num-gold">#{index + 1}</div>
            <div className="setup-inputs-row">
              <input 
                type="text" 
                value={prize.name} 
                placeholder="경품 명칭"
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                className="input-premium-final"
              />
              <input 
                type="number" 
                value={prize.totalCount} 
                onChange={(e) => handleChange(index, 'totalCount', e.target.value)}
                className="input-premium-count-final"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="action-floating-dual-perfect">
        <button 
          className="mockup-btn-extreme-gold" 
          onClick={() => setIsSetupMode(false)}
          style={{ background: '#000', color: 'var(--primary)', border: '1px solid var(--primary)', boxShadow: 'none' }}
        >
          취소
        </button>
        <button 
          className="mockup-btn-extreme-gold" 
          onClick={() => { handleSave(); setIsSetupMode(false); }}
          disabled={saving}
        >
          🚀 새로운 이벤트 시작하기
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .setup-slim-card-final { background: rgba(255,255,255,0.03); padding: 0.9rem; border-radius: 12px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .setup-num-gold { color: var(--primary); font-size: 1.1rem; font-weight: 900; min-width: 30px; }
        .setup-inputs-row { flex: 1; display: flex; gap: 8px; }
        .input-premium-final { flex: 3; background: #000; border: 1px solid #333; border-radius: 10px; padding: 0.7rem; color: #fff; font-size: 0.9rem; outline: none; }
        .input-premium-count-final { flex: 1; background: #000; border: 1px solid #333; border-radius: 10px; padding: 0.7rem; color: var(--primary); font-size: 0.9rem; font-weight: 800; text-align: center; outline: none; }
      `}} />
    </div>
  );
};

export default MobileAdminEvent;
