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
  const { tenantConfig, tenantId } = useTenant();

  return (
    <SwipeNavigation>
      <div className="app">
        <ScrollToTop />
        <GlobalStyle />
        <Navbar />
        <main style={{ paddingTop: '60px' }}>
          <Outlet />
        </main>
        <footer className="app-footer" style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid #111', background: '#000' }}>
          <p className="footer-copyright" style={{ color: '#444', fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto' }}>
            &copy; {new Date().getFullYear()} {tenantConfig.brandNameKr || tenantConfig.brandName || '이벤트룰렛'}. All rights reserved.
          </p>
          {location.pathname === `/${tenantId}` && (
            <div style={{ marginTop: '1.5rem' }}>
              <a 
                href={`/${tenantId}/admin`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="admin-open-link"
                style={{ 
                  display: 'inline-block', textDecoration: 'none', background: 'transparent', border: '1px solid #222', color: '#333', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s ease', zIndex: 99999, position: 'relative'
                }}
              >
                관리자 센터 새 창으로 열기
              </a>
            </div>
          )}
        </footer>
      </div>
    </SwipeNavigation>
  );
};

// [NEW] Admin Root to bypass Navbar/Footer (with TenantProvider)
const AdminRoot = () => (
  <TenantProvider>
    <SwipeNavigation>
      <div className="admin-app">
        <GlobalStyle />
        <AdminLayout />
      </div>
    </SwipeNavigation>
  </TenantProvider>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dine-event" replace />
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
