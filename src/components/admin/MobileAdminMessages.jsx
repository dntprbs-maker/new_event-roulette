import React, { useState, useMemo } from 'react';

const MobileAdminMessages = ({ 
  entries, uniqueData, smsTemplate, setSmsTemplate, clearAll 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSmsEditor, setShowSmsEditor] = useState(false);

  // 실시간 검색 필터링
  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    const lowerSearch = searchTerm.toLowerCase();
    return entries.filter(e => 
      e.name.toLowerCase().includes(lowerSearch) || 
      e.phone.includes(searchTerm) ||
      e.prize.toLowerCase().includes(lowerSearch)
    );
  }, [entries, searchTerm]);

  return (
    <div className="mobile-admin-container" style={{ padding: '0 0.8rem 180px 0.8rem', animation: 'fadeIn 0.5s ease-out' }}>
      

      {/* 문자 템플릿 편집기 - 화면 중앙 팝업 모달 */}
      {showSmsEditor && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{ 
            background: '#111', border: '1px solid var(--primary)',
            borderRadius: '24px', padding: '2rem 1.5rem',
            width: '100%', maxWidth: '420px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8)'
          }}>
            {/* 모달 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <label style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: '800' }}>
                💬 이벤트 문자 템플릿
              </label>
              {/* 닫기 버튼 */}
              <button 
                onClick={() => setShowSmsEditor(false)}
                style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            </div>
            {/* 문자 내용 입력 */}
            <textarea 
              value={smsTemplate} 
              onChange={(e) => setSmsTemplate(e.target.value)} 
              placeholder="전송할 문자 내용을 입력하세요..."
              style={{ 
                width: '100%', height: '120px', background: '#000',
                border: '1px solid #333', borderRadius: '12px',
                padding: '1rem', color: '#fff', fontSize: '0.9rem',
                outline: 'none', resize: 'none'
              }}
            />
            <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.6rem' }}>
              ※ 현재 {uniqueData.length}명의 고객에게 발송됩니다.
            </p>
            {/* 확인 버튼 */}
            <button
              onClick={() => setShowSmsEditor(false)}
              className="premium-gold-button"
              style={{ width: '50%', marginTop: '1rem', padding: '0.8rem', display: 'block', margin: '1rem auto 0' }}
            >
              적용
            </button>
          </div>
        </div>
      )}

      {/* 스마트 검색창 - sticky로 변경되어 별도 marginTop 불필요 */}
      <div className="entry-search-wrapper">
        <span style={{ fontSize: '1.1rem', opacity: 0.5 }}>🔍</span>
        <input 
          type="text" 
          placeholder="고객 성함, 연락처, 경품으로 검색..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.5, fontSize: '1.2rem' }}>×</button>
        )}
      </div>

      {/* 응모 내역 슬림 리스트 - fixed 검색창(55px) + 여백 = 65px 만큼 아래로 내림 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '65px' }}>
        {filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#333', fontStyle: 'italic' }}>
            {searchTerm ? '검색 결과가 없습니다.' : '내역이 존재하지 않습니다.'}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isWinner = !entry.prize.includes('꽝');
            return (
              <div key={entry.id} className={`premium-entry-item ${isWinner ? 'winner' : ''}`} style={{ padding: '0.6rem 1.5rem' }}>
                {/* 1행: 응모시간 */}
                <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '1px', lineHeight: '1.2' }}>
                  {entry.date}
                </div>
                {/* 2행: 성함 (전화번호) */}
                <div style={{ marginBottom: '2px', lineHeight: '1.3' }}>
                  <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.05rem' }}>{entry.name}</span>
                  <span style={{ color: '#888', fontWeight: '400', fontSize: '0.85rem', marginLeft: '6px' }}>({entry.phone})</span>
                </div>
                {/* 3행: 당첨 경품 */}
                <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.95rem', lineHeight: '1.2' }}>
                  {isWinner ? '✨ ' : ''}{entry.prize}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#111', border: '1px solid var(--primary)', borderRadius: '30px', padding: '2.5rem 1.5rem', width: '100%', textAlign: 'center', boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: '900' }}>응모 내역 삭제</h3>
            <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              정말 모든 응모 내역을 삭제하시겠습니까?<br/>
              <span style={{ color: '#ff4d4d' }}>삭제된 데이터는 복구할 수 없습니다.</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => { clearAll(); setShowDeleteConfirm(false); }}
                className="premium-gold-button"
                style={{ background: '#ff4d4d', border: 'none', color: '#fff', padding: '1.2rem', borderRadius: '15px' }}
              >
                🔥 전체 삭제 실행
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                style={{ background: 'transparent', color: '#666', border: 'none', padding: '1rem' }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 플로팅 듀얼 버튼 */}
      <div className="floating-btn-container" style={{ padding: '0 1.5rem 30px 1.5rem' }}>
        <div className="dual-floating-group">
          <button 
            className="premium-gold-button"
            onClick={() => setShowSmsEditor(!showSmsEditor)}
          >
            📝 문자내용수정
          </button>
          <button 
            className="premium-gold-button"
            onClick={() => {
              const numbers = uniqueData.map(e => e.phone.replace(/[^0-9]/g, '')).join(',');
              window.location.href = `sms:${numbers}?body=${encodeURIComponent(smsTemplate)}`;
            }}
          >
            💬 문자 발송하기
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default MobileAdminMessages;
