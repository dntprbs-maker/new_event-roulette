import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';

const AdminLayout = () => {
  // 사용자의 요청에 따라 '메뉴관리' 탭을 목록에서 제거하여 숨깁니다.
  const navItems = [
    { path: '/admin/info', label: '식당관리', icon: '🏠' },
    { path: '/admin/event', label: '이벤트', icon: '⚙️' },
    { path: '/admin/messages', label: '고객 관리', icon: '👥' },
  ];

  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 페이지가 관리자 메인(/admin/info)인 경우 뒤로가기를 숨기거나 다르게 처리할 수 있지만,
  // 일단 모든 페이지에서 보이도록 설정합니다.

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
            <NavLink to="/" style={{ 
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
