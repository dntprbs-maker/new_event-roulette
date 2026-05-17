import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const location = useLocation();
  const [brandName, setBrandName] = useState('DINE EVENT');

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const homeDoc = await getDoc(doc(db, 'settings', 'home'));
        if (homeDoc.exists() && homeDoc.data().brandName) {
          setBrandName(homeDoc.data().brandName);
        }
      } catch (err) {
        console.error("Navbar brand fetch error:", err);
      }
    };
    fetchBrand();
  }, []);

  return (
    <nav className="navbar" style={{ position: 'fixed', top: 0, width: '100%', padding: '0.8rem 1rem', zIndex: 1000, background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 1, maxWidth: '55%' }}>
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
          <Link to="/" className="nav-link-item" style={{ color: location.pathname === '/' ? 'var(--primary)' : '#fff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>HOME</Link>
          <Link to="/menu" className="nav-link-item" style={{ color: location.pathname === '/menu' ? 'var(--primary)' : '#fff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>MENU</Link>
          <Link to="/event" className="nav-link-item" style={{ color: location.pathname === '/event' ? 'var(--primary)' : '#fff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>EVENT</Link>
          <Link to="/location" className="nav-link-item" style={{ color: location.pathname === '/location' ? 'var(--primary)' : '#fff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>MAP</Link>
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
