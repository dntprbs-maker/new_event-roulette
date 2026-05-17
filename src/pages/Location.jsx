import React, { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';

const Location = () => {
  const { fetchDocWithFallback } = useTenant();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoc = async () => {
      try {
        const locDoc = await fetchDocWithFallback('settings', 'location');
        if (locDoc.exists() && locDoc.data().address) {
          setAddress(locDoc.data().address);
        } else {
          setAddress('서울특별시 은평구 역촌동 51-42');
        }
      } catch (err) {
        console.error(err);
        setAddress('서울특별시 은평구 역촌동 51-42');
      } finally {
        setLoading(false);
      }
    };
    fetchLoc();
  }, []);

  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address || '서울특별시 은평구 역촌동 51-42')}&t=&z=17&ie=UTF8&iwloc=&output=embed`;

  return (
    <section className="container" style={{ padding: 'clamp(1.5rem, 6vw, 3rem) 1rem', textAlign: 'center', minHeight: '100vh' }}>
      
      <div style={{ 
        width: 'min(95%, 600px)', 
        margin: '0 auto 1.5rem', 
        textAlign: 'left', 
        padding: '0 0.5rem'
      }}>
        <p style={{ 
          color: 'var(--primary)', 
          fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', 
          fontWeight: '700', 
          lineHeight: '1.4', 
          wordBreak: 'keep-all',
          letterSpacing: '-0.5px'
        }}>
          {loading ? '주소를 확인하고 있습니다...' : `주소 : ${address}`}
        </p>
      </div>
      
      <div className="glass" style={{ 
        width: 'min(95%, 600px)', 
        height: 'clamp(300px, 50vh, 450px)', 
        overflow: 'hidden', 
        margin: '0 auto 3rem', 
        borderRadius: '25px', 
        border: '1px solid rgba(197, 160, 89, 0.4)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000'
      }}>
        {loading ? (
          <div style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>🗺️ 지도를 불러오는 중입니다...</div>
        ) : (
          <iframe 
            title="Google Map"
            width="100%" 
            height="100%" 
            frameBorder="0" 
            src={mapUrl}
            style={{ filter: 'invert(90%) hue-rotate(180deg) contrast(1.2)' }}
          ></iframe>
        )}
      </div>

      {/* 사용자의 요청에 따라 '메인으로 돌아가기' 버튼을 모든 화면에서 삭제했습니다. */}
      <div style={{ height: '6rem' }}></div>
    </section>
  );
};

export default Location;
