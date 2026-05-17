import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useTenant } from '../../context/TenantContext';

const AdminLayout = () => {
  const { tenantId, tenantMeta } = useTenant();
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();

  // 사장님 비밀코드 관리자 인증 상태 로드
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(`admin_auth_${tenantId}`) === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const correctCode = tenantMeta?.adminPasscode || '1234';
    if (passcode === correctCode) {
      sessionStorage.setItem(`admin_auth_${tenantId}`, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('❌ 비밀코드가 올바르지 않습니다.');
    }
  };

  // 인증 실패 시 로그인 폼 송출
  if (!isAuthenticated) {
    return (
      <div style={{
        background: 'radial-gradient(circle at 50% 50%, #151515 0%, #050505 100%)',
        color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Outfit', 'Inter', sans-serif", padding: '1rem'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(197, 160, 89, 0.3)',
          borderRadius: '24px', padding: '3rem 2rem', width: '100%', maxWidth: '380px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎪</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            가맹점 로그인
          </h2>
          <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '2.5rem', wordBreak: 'keep-all' }}>
            매장 사장님 전용 공간입니다. 관리자 전용 비밀코드를 입력하고 접속해 주세요.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="password" 
              placeholder="사장님 비밀코드 입력" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={{
                width: '100%', padding: '1rem', background: '#000', border: '1px solid #333',
                borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', textAlign: 'center',
                letterSpacing: '3px'
              }}
              autoFocus
            />

            {error && (
              <p style={{ color: '#ff4d4d', fontSize: '0.8rem', margin: 0, fontWeight: 'bold' }}>
                {error}
              </p>
            )}

            <button type="submit" style={{
              padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)',
              color: '#000', border: 'none', fontWeight: '900', fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 5px 20px rgba(248, 181, 0, 0.2)'
            }}>
              매장 접속하기
            </button>
          </form>

          <button 
            onClick={() => navigate(`/${tenantId}`)}
            style={{
              background: 'transparent', border: 'none', color: '#666', marginTop: '1.5rem',
              cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline'
            }}
          >
            일반 고객 화면으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 사용자의 요청에 따라 '메뉴관리' 탭을 목록에서 제거하여 숨깁니다.
  const navItems = [
    { path: `/${tenantId}/admin/info`, label: '식당관리', icon: '🏠' },
    { path: `/${tenantId}/admin/event`, label: '이벤트', icon: '⚙️' },
    { path: `/${tenantId}/admin/messages`, label: '고객 관리', icon: '👥' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      {/* Header Section - 스크롤 시에도 항상 상단에 고정 */}
      <div style={{ 
        position: 'fixed',  // sticky → fixed 로 변경 (가장 확실한 고정 방식)
        top: 0, 
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000, 
        background: '#050505', 
        borderBottom: isMobile ? '1px solid #111' : '1px solid #222',
        padding: isMobile ? '0.5rem 0 0.15rem 0' : '1.5rem 0 1rem 0'
      }}>
        <div className={isMobile ? "" : "container"}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: isMobile ? '0.4rem' : '1.5rem',
            padding: isMobile ? '0 1rem' : '0' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* 뒤로가기 버튼 */}
              <button 
                onClick={() => navigate(-1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(197, 160, 89, 0.4)',
                  color: 'var(--primary)',
                  width: isMobile ? '32px' : '36px',
                  height: isMobile ? '32px' : '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: 0,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(197, 160, 89, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                ←
              </button>
              
              <h2 style={{ 
                fontSize: isMobile ? 'clamp(1rem, 5vw, 1.4rem)' : '1.4rem', 
                color: '#fff', 
                margin: 0, 
                fontWeight: '800', 
                textAlign: 'left',
                whiteSpace: 'nowrap'
              }}>
                사장님 관리 센터
              </h2>
            </div>
            <NavLink to={`/${tenantId}`} style={{ 
              textDecoration: 'none', 
              padding: isMobile ? '0.3rem 0.6rem' : '0.4rem 1rem', 
              borderRadius: '6px', 
              fontSize: isMobile ? '0.7rem' : '0.8rem', 
              background: '#222', 
              color: '#888',
              marginLeft: '10px'
            }}>나가기</NavLink>
          </div>
          
          <nav style={{
            display: 'flex',
            justifyContent: isMobile ? 'space-between' : 'flex-start',
            gap: isMobile ? '4px' : '0.8rem',
            padding: isMobile ? '0.15rem 1rem' : '0.5rem 0',
            width: '100%',
            background: isMobile ? 'transparent' : 'none',
            display: isMobile ? 'flex' : 'grid',
            gridTemplateColumns: isMobile ? 'none' : 'repeat(3, 1fr)'
          }}>
            {!isMobile && <style dangerouslySetInnerHTML={{__html: `.admin-nav-scroll::-webkit-scrollbar { display: none; }`}} />}
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  padding: isMobile ? '0.4rem 0.2rem' : '0.8rem 0.4rem',
                  borderRadius: isMobile ? '0' : '10px',
                  fontSize: isMobile ? 'clamp(0.7rem, 3.5vw, 0.85rem)' : '0.85rem',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  background: isMobile ? 'transparent' : (isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)'),
                  color: isActive ? (isMobile ? 'var(--primary)' : '#000') : '#888',
                  borderBottom: isMobile && isActive ? '2px solid var(--primary)' : 'none',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  alignItems: 'center',
                  gap: isMobile ? '3px' : '5px',
                  flex: isMobile ? 1 : 'none'
                })}
              >
                <span style={{ fontSize: isMobile ? 'clamp(0.9rem, 4vw, 1.1rem)' : 'inherit' }}>{item.icon}</span>
                <span style={{ display: isMobile ? 'inline' : 'inline' }}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* 헤더 높이만큼 콘텐츠 영역을 아래로 밀어내기 */}
      <div className="admin-layout-wrapper" style={{ paddingTop: isMobile ? '130px' : '175px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
