import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import MobileAdminInfo from '../../components/admin/MobileAdminInfo';
import AdminNotice from './AdminNotice';
import { db, storage } from '../../firebase';
import { setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTenant } from '../../context/TenantContext';

const AdminInfo = () => {
  const { tenantId, getDocRef, fetchDocWithFallback } = useTenant();
  const navigate = useNavigate();
  const [homeSettings, setHomeSettings] = useState({ brandName: '', topLabel: '', title: '', subtitle: '', heroImage: '' });
  const [menuImages, setMenuImages] = useState({ image1: '', image2: '' });
  const [locationSettings, setLocationSettings] = useState({ address: '' });
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  
  const heroInputRef = useRef(null);
  const menu1InputRef = useRef(null);
  const menu2InputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homeDoc = await fetchDocWithFallback('settings', 'home');
        const locDoc = await fetchDocWithFallback('settings', 'location');
        const menuDoc = await fetchDocWithFallback('content', 'menu_image');
        const hData = homeDoc.exists() ? homeDoc.data() : homeSettings;
        const lData = locDoc.exists() ? locDoc.data() : locationSettings;
        const mData = menuDoc.exists() ? { 
          image1: menuDoc.data().image1 ?? menuDoc.data().imageUrl ?? '', 
          image2: menuDoc.data().image2 ?? '' 
        } : menuImages;
        setHomeSettings(hData);
        setLocationSettings(lData);
        setMenuImages(mData);
        setOriginalData(JSON.stringify({ hData, lData, mData }));
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isDirty = originalData !== JSON.stringify({ hData: homeSettings, lData: locationSettings, mData: menuImages });

  // [NEW] 페이지 이탈 차단 로직 (React Router 6.7+)
  const blocker = useBlocker(({ nextLocation }) => isDirty && !saving);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSave = async (silent = false) => {
    setSaving(true);
    try {
      await setDoc(getDocRef('settings', 'home'), homeSettings);
      await setDoc(getDocRef('settings', 'location'), locationSettings);
      await setDoc(getDocRef('content', 'menu_image'), { imageUrl: menuImages.image1, image1: menuImages.image1, image2: menuImages.image2 });
      setOriginalData(JSON.stringify({ hData: homeSettings, lData: locationSettings, mData: menuImages }));
      if (!silent) { setShowToast(true); setTimeout(() => setShowToast(false), 2000); }
      return true;
    } catch (err) {
      alert('저장 실패: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndProceed = async () => {
    const success = await handleSave(true);
    if (success && blocker.proceed) blocker.proceed();
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1000; // 용량 최적화를 위해 조금 더 축소
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Base64 문자열로 직접 반환 (Storage를 거치지 않음)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("이미지 로드 실패"));
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // 더 이상 파일을 고를 때 '저장중'이 되지 않음 (버튼 안 굳음!)
    try {
      const base64Image = await compressImage(file);

      if (type === 'hero') setHomeSettings(prev => ({...prev, heroImage: base64Image}));
      else if (type === 'menu1') setMenuImages(prev => ({...prev, image1: base64Image}));
      else if (type === 'menu2') setMenuImages(prev => ({...prev, image2: base64Image}));
    } catch (err) {
      console.error(err);
      alert('이미지 처리 실패: ' + err.message);
    }
  };



  const isMobile = useIsMobile(768);

  if (loading) return <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>데이터 불러오는 중...</div>;

  if (isMobile) {
    return (
      <div className="admin-content-inner">
        <MobileAdminInfo 
          homeSettings={homeSettings} 
          setHomeSettings={setHomeSettings}
          locationSettings={locationSettings}
          setLocationSettings={setLocationSettings}
          menuImages={menuImages}
          handleImageUpload={handleImageUpload}
          handleSave={handleSave}
          saving={saving}
        />
        {/* 이동 차단 모달은 공통으로 사용 */}
        {blocker.state === "blocked" && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', 
            zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '30px', border: '1px solid var(--primary)', background: '#111', width: '90%', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>저장되지 않았습니다</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={handleSaveAndProceed} style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '10px', fontWeight: 'bold' }}>저장 후 이동</button>
                <button onClick={() => blocker.proceed?.()} style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #331111', padding: '1rem', borderRadius: '10px' }}>저장 안함</button>
                <button onClick={() => blocker.reset?.()} style={{ color: '#888', border: 'none', background: 'none' }}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-content-inner" style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      
      {/* [NEW] 중앙 집중식 이동 차단 모달 UI */}
      {blocker.state === "blocked" && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', 
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="glass" style={{ 
            padding: '3rem', borderRadius: '40px', border: '1px solid var(--primary)', 
            background: '#111', width: 'min(90%, 500px)', textAlign: 'center',
            boxShadow: '0 30px 100px rgba(0,0,0,1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⚠️</div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: '900' }}>저장되지 않았습니다</h2>
            <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
              수정하신 소중한 정보가 아직 저장되지 않았습니다.<br/>
              이대로 페이지를 벗어나시겠습니까?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button onClick={handleSaveAndProceed} className="premium-gold-button" style={{ padding: '1.2rem', borderRadius: '15px', fontSize: '1.1rem' }}>
                💾 변경사항 저장 후 이동
              </button>
              <button onClick={() => blocker.proceed?.()} style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #331111', padding: '1rem', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                🗑️ 저장 안함 (취소)
              </button>
              <button onClick={() => blocker.reset?.()} style={{ background: 'transparent', color: '#666', border: 'none', padding: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                닫기 (계속 수정하기)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass admin-card-glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
          <h3 style={{ color: 'var(--primary)', margin: 0 }}>🏠 식당 관리</h3>
          <button 
            onClick={() => setShowNoticeModal(true)}
            className="premium-gold-button"
            style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem' }}
          >
            공지사항
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid #222', paddingBottom: '0.5rem', fontSize: '1rem' }}>기본 정보 & 이미지</h4>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>🚩 매장 이름</label>
              <input type="text" value={homeSettings.brandName} onChange={(e) => setHomeSettings(prev => ({...prev, brandName: e.target.value}))} style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '0.8rem', color: '#fff', borderRadius: '10px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>📍 매장 주소</label>
              <input type="text" value={locationSettings.address} onChange={(e) => setLocationSettings(prev => ({...prev, address: e.target.value}))} style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '0.8rem', color: '#fff', borderRadius: '10px' }} />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>🖼️ 메인 배경 이미지</label>
              <div className="file-input-wrapper">
                <input type="file" ref={heroInputRef} accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} style={{ color: '#555', fontSize: '0.75rem', flex: 1 }} />
                {homeSettings.heroImage && (
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <img src={homeSettings.heroImage} alt="" style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '5px' }} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>🍴 메뉴 이미지 1 (메인)</label>
              <div className="file-input-wrapper" style={{ border: '1px dashed var(--primary)' }}>
                <input type="file" ref={menu1InputRef} accept="image/*" onChange={(e) => handleImageUpload(e, 'menu1')} style={{ color: '#555', fontSize: '0.75rem', flex: 1 }} />
                {menuImages.image1 && (
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <img src={menuImages.image1} alt="" style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '5px' }} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>🍴 메뉴 이미지 2 (추가)</label>
              <div className="file-input-wrapper" style={{ border: '1px dashed var(--primary)' }}>
                <input type="file" ref={menu2InputRef} accept="image/*" onChange={(e) => handleImageUpload(e, 'menu2')} style={{ color: '#555', fontSize: '0.75rem', flex: 1 }} />
                {menuImages.image2 && (
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <img src={menuImages.image2} alt="" style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '5px' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid #222', paddingBottom: '0.5rem', fontSize: '1rem' }}>홈 화면 문구 설정</h4>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>✨ 상단 강조 문구</label>
              <input type="text" value={homeSettings.topLabel} onChange={(e) => setHomeSettings(prev => ({...prev, topLabel: e.target.value}))} style={{ width: '100%', background: '#000', border: '1px solid #333', padding: '0.8rem', color: '#fff', borderRadius: '10px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>메인 대제목</label>
              <textarea value={homeSettings.title} onChange={(e) => setHomeSettings(prev => ({...prev, title: e.target.value}))} style={{ width: '100%', background: '#000', border: '1px solid #333', padding: '0.8rem', color: '#fff', borderRadius: '10px', height: '70px', resize: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>메인 소제목</label>
              <textarea value={homeSettings.subtitle} onChange={(e) => setHomeSettings(prev => ({...prev, subtitle: e.target.value}))} style={{ width: '100%', background: '#000', border: '1px solid #333', padding: '0.8rem', color: '#fff', borderRadius: '10px', height: '100px', resize: 'none' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="floating-btn-container">
        <button onClick={() => handleSave()} disabled={saving} className="premium-gold-button" style={{ pointerEvents: 'auto', padding: '1.2rem 4rem', borderRadius: '50px', fontSize: '1.1rem' }}>
          {saving ? '⏳ 저장중...' : '💾 변경내용저장'}
        </button>
      </div>

      {showToast && (
        <div style={{ position: 'fixed', bottom: '110px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 0, 0, 0.9)', color: 'var(--primary)', padding: '1rem 2rem', borderRadius: '15px', border: '1px solid var(--primary)', zIndex: 100001, animation: 'fadeInUp 0.3s ease-out', fontWeight: 'bold' }}>
          ✅ 수정사항이 저장되었습니다.
        </div>
      )}

      {/* 공지사항 팝업 - 반투명 배경 + 중앙 팝업 창 */}
      {showNoticeModal && (
        // 바깥 클릭 시 팝업 닫기 (반투명 오버레이)
        <div
          onClick={() => setShowNoticeModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)', // 배경 투명도 낮춤 → 뒤 화면이 살짝 보임
            backdropFilter: 'blur(6px)',
            zIndex: 999999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
        >
          {/* 팝업 창 본체 - 클릭 이벤트 전파 차단 */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '547px', // 820px의 2/3
              maxHeight: '60vh',                 // 90vh의 2/3
              overflowY: 'auto',                 // 내용이 길면 팝업 내부에서 스크롤
              background: '#0d0d0d',
              borderRadius: '24px',
              border: '1px solid rgba(197, 160, 89, 0.35)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
              position: 'relative',
              padding: '1.5rem 1.5rem 2rem',
              animation: 'popupFadeIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowNoticeModal(false)}
              style={{
                position: 'sticky', top: 0, float: 'right',
                background: 'rgba(255,255,255,0.07)', border: '1px solid #333',
                color: '#fff', fontSize: '1.2rem', cursor: 'pointer',
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.5rem', zIndex: 10, flexShrink: 0
              }}
            >
              ✕
            </button>
            <AdminNotice onClose={() => setShowNoticeModal(false)} />
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes popupFadeIn {
              from { opacity: 0; transform: scale(0.93) translateY(12px); }
              to   { opacity: 1; transform: scale(1)    translateY(0); }
            }
          `}} />
        </div>
      )}

      {/* 빌드 버전 표시 (최신 배포 확인용) */}
      <div style={{ position: 'fixed', bottom: '5px', left: '10px', fontSize: '10px', color: '#333', zIndex: 9999, pointerEvents: 'none' }}>
        v1.1.0 - Notice Update
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @media (max-width: 800px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
};

export default AdminInfo;
