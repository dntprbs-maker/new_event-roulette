import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

const Navbar = () => {
  const location = useLocation();
  const { tenantId, tenantConfig } = useTenant();
  const brandName = tenantConfig.brandNameKr || tenantConfig.brandName || '이벤트룰렛';

  return (
    <nav className="navbar" style={{ position: 'fixed', top: 0, width: '100%', padding: '0.8rem 1rem', zIndex: 1000, background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <Link to={`/${tenantId}`} style={{ textDecoration: 'none', flexShrink: 1, maxWidth: '55%' }}>
          <h2 className="nav-brand-name" style={{ 
            color: 'var(--primary)', 
            letterSpacing: '0.5px', 
            fontSize: '1.1rem', 
            margin: 0,
            textTransform: 'uppercase',
            fontWeight: '900',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {brandName}
          </h2>
        </Link>
        <div className="nav-links-container" style={{ 
          display: 'flex', 
          gap: '0.8rem', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          flex: 1
        }}>
          <Link to={`/${tenantId}`} className="nav-link-item" style={{ color: location.pathname === `/${tenantId}` ? 'var(--primary)' : '#fff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>HOME</Link>
          <Link to={`/${tenantId}/menu`} className="nav-link-item" style={{ color: location.pathname === `/${tenantId}/menu` ? 'var(--primary)' : '#fff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>MENU</Link>
          <Link to={`/${tenantId}/event`} className="nav-link-item" style={{ color: location.pathname === `/${tenantId}/event` ? 'var(--primary)' : '#fff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>EVENT</Link>
          <Link to={`/${tenantId}/location`} className="nav-link-item" style={{ color: location.pathname === `/${tenantId}/location` ? 'var(--primary)' : '#fff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>MAP</Link>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .navbar { padding: 0.6rem 0.4rem 0.6rem 0 !important; }
          .nav-brand-name { font-size: 0.85rem !important; }
          .nav-links-container { gap: 0.4rem !important; }
          .nav-link-item { font-size: 0.55rem !important; letter-spacing: -0.5px !important; }
        }
      `}} />
    </nav>
  );
};

export default Navbar;
