import React, { useState, useEffect } from 'react'
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate, 
  useLocation, 
  useNavigate, 
  Outlet 
} from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Event from './pages/Event'
import Location from './pages/Location'
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { TenantProvider, useTenant } from './context/TenantContext';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminInfo from './pages/admin/AdminInfo'
// import AdminMenu from './pages/admin/AdminMenu' // [삭제] 사용자 요청에 따라 제외
import AdminEvent from './pages/admin/AdminEvent'
import AdminMessages from './pages/admin/AdminMessages'
import AdminNoticeManager from './pages/admin/AdminNoticeManager' // [NEW] 공지 관리 센터 임포트

// [NEW] 회사 소개 & 슈퍼관리자 페이지 임포트
import CompanyIntro from './pages/CompanyIntro'
import SuperAdmin from './pages/SuperAdmin'

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// 스와이프 내비게이션 핸들러 (개선된 영역 격리 로직 - 멀티 테넌트 동적 지원)
const SwipeNavigation = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // 경로 정규화 (끝 슬래시 제거)
  const normalizePath = (path) => path.replace(/\/$/, '') || '/';
  const currentPath = normalizePath(location.pathname);

  // 테넌트 ID 및 어드민 여부 동적 분석
  const pathParts = currentPath.split('/').filter(Boolean);
  const tenantId = pathParts[0] || 'dine-event';
  const isAdmin = pathParts[1] === 'admin';

  // 테넌트 맞춤형 내비게이션 세트 실시간 구성
  const sets = {
    public: [`/${tenantId}`, `/${tenantId}/menu`, `/${tenantId}/event`, `/${tenantId}/location`],
    admin: [`/${tenantId}/admin/info`, `/${tenantId}/admin/event`, `/${tenantId}/admin/messages`]
  };

  const activeSet = isAdmin ? sets.admin : sets.public;
  const minSwipeDistance = isAdmin ? 100 : 70;

  const onTouchStart = (e) => {
    // 모달 오버레이 감지 시 스와이프 잠금
    if (document.querySelector('.modal-overlay')) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    if (touchStart) setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = activeSet.indexOf(currentPath);

    // 영역 내에 있을 때만 이동 (바보 같은 영역 이탈 방지)
    if (currentIndex !== -1) {
      if (isLeftSwipe && currentIndex < activeSet.length - 1) {
        navigate(activeSet[currentIndex + 1]);
      } else if (isRightSwipe && currentIndex > 0) {
        navigate(activeSet[currentIndex - 1]);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEnd} 
      style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}
    >
      {children}
    </div>
  );
};

const GlobalStyle = () => (
  <style dangerouslySetInnerHTML={{__html: `
    * { box-sizing: border-box; }
    body { overflow-x: hidden; touch-action: pan-y; }
    @media (max-width: 768px) {
      .app-footer { padding: 2.5rem 1rem !important; }
      .footer-copyright { font-size: 0.75rem !important; word-break: keep-all !important; line-height: 1.5 !important; }
      .admin-open-link { font-size: 0.7rem !important; padding: 0.4rem 0.8rem !important; }
    }
  `}} />
);

// [NEW] Root Layout for Public Pages (with TenantProvider)
const RootLayout = () => {
  return (
    <TenantProvider>
      <RootLayoutInner />
    </TenantProvider>
  );
};

const RootLayoutInner = () => {
  const location = useLocation();
  const { tenantConfig, tenantId, tenantMeta } = useTenant();

  // [NEW] 4단계: 매장 정지 시 차단 화면 송출
  if (tenantMeta?.status === 'suspended') {
    return (
      <div style={{
        background: '#0a0a0a', color: '#fff', minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontFamily: "system-ui, sans-serif",
        flexDirection: 'column', padding: '2rem', textAlign: 'center'
      }}>
        <span style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '1rem' }}>
          서비스 점검 및 이용 제한 안내
        </h2>
        <p style={{ color: '#888', maxWidth: '400px', lineHeight: 1.6, margin: '0 0 2rem 0', wordBreak: 'keep-all' }}>
          현재 본 매장(ID: {tenantId})의 서비스 이용 기간이 만료되었거나 정지 조치되었습니다. 상세 문의는 마스터 관리자에게 문의해 주세요.
        </p>
        <a href="/" style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.9rem' }}>홈페이지로 돌아가기</a>
      </div>
    );
  }

  const isTenantHome = location.pathname === `/${tenantId}` || location.pathname === `/${tenantId}/`;

  return (
    <SwipeNavigation>
      <div className="app">
        <ScrollToTop />
        <GlobalStyle />
        {!isTenantHome && <Navbar />}
        <main style={{ paddingTop: isTenantHome ? '0px' : '60px' }}>
          <Outlet />
        </main>
        {!isTenantHome && (
          <footer className="app-footer" style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid #111', background: '#000' }}>
            <p className="footer-copyright" style={{ color: '#444', fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto' }}>
              &copy; {new Date().getFullYear()} {tenantConfig.brandNameKr || tenantConfig.brandName || '이벤트룰렛'}. All rights reserved.
            </p>
          </footer>
        )}
        {isTenantHome && (
          <div style={{ position: 'fixed', bottom: '15px', right: '15px', zIndex: 99999, opacity: 0.6 }}>
            <a 
              href={`/${tenantId}/admin`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="admin-open-link"
              style={{ 
                display: 'inline-block', textDecoration: 'none', background: 'rgba(0,0,0,0.6)', border: '1px solid #222', color: '#888', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.3s ease'
              }}
            >
              🔑 관리자 센터
            </a>
          </div>
        )}
      </div>
    </SwipeNavigation>
  );
};

// [NEW] Admin Root to bypass Navbar/Footer (with TenantProvider)
const AdminRoot = () => (
  <TenantProvider>
    <AdminRootInner />
  </TenantProvider>
);

const AdminRootInner = () => {
  const { tenantId, tenantMeta } = useTenant();

  // [NEW] 4단계: 매장 정지 시 관리센터 접근 원천 차단
  if (tenantMeta?.status === 'suspended') {
    return (
      <div style={{
        background: '#0a0a0a', color: '#fff', minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontFamily: "system-ui, sans-serif",
        flexDirection: 'column', padding: '2rem', textAlign: 'center'
      }}>
        <span style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ff4d4d', marginBottom: '1rem' }}>
          관리 센터 진입 제한
        </h2>
        <p style={{ color: '#888', maxWidth: '400px', lineHeight: 1.6, margin: '0 0 2rem 0', wordBreak: 'keep-all' }}>
          해당 가맹점(ID: {tenantId})은 현재 서비스 정지 상태입니다. 마스터 시스템에서 서비스를 활성화해야 관리 센터 진입이 가능합니다.
        </p>
        <a href="/" style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.9rem' }}>홈페이지로 돌아가기</a>
      </div>
    );
  }

  return (
    <SwipeNavigation>
      <div className="admin-app">
        <GlobalStyle />
        <AdminLayout />
      </div>
    </SwipeNavigation>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <CompanyIntro />
  },
  {
    path: "/master-admin",
    element: <SuperAdmin />
  },
  {
    path: "/:tenantId",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "menu", element: <Menu /> },
      { path: "event", element: <Event /> },
      { path: "location", element: <Location /> },
    ]
  },
  {
    path: "/:tenantId/admin",
    element: <AdminRoot />,
    children: [
      { index: true, element: <Navigate to="info" replace /> },
      { path: "info", element: <AdminInfo /> },
      // { path: "menu", element: <AdminMenu /> }, // [제거]
      { path: "event", element: <AdminEvent /> },
      { path: "messages", element: <AdminMessages /> },
      { path: "notice-manager", element: <AdminNoticeManager /> }, // [NEW] 공지 관리 센터 경로 추가
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />
}

export default App
