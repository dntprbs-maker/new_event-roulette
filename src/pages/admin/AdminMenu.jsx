import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../firebase';
import { setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTenant } from '../../context/TenantContext';

const AdminMenu = () => {
  const { tenantId, getDocRef, fetchDocWithFallback } = useTenant();
  const [menuImageUrl, setMenuImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuDoc = await fetchDocWithFallback('content', 'menu_image');
        if (menuDoc.exists()) {
          setMenuImageUrl(menuDoc.data().imageUrl || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

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
          const maxWidth = 1280;
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("압축 실패"));
          }, 'image/jpeg', 0.7);
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };



  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const storageRef = ref(storage, `menu/menu_image_${Date.now()}.jpg`);
      const snapshot = await uploadBytes(storageRef, compressedBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await setDoc(getDocRef('content', 'menu_image'), { imageUrl: downloadURL });
      setMenuImageUrl(downloadURL);

      // 토스트 알림 표시 (2초)
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

    } catch (err) {
      console.error(err);
      alert('업로드 실패: ' + err.message);
    } finally {
      setUploading(false);
      // 입력창 초기화 (동일 파일 재업로드 가능하게 함)
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>데이터 로딩 중...</div>;

  return (
    <>
      <div className="admin-content-inner" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '150px' }}>
        <div className="glass admin-card-glass">
          <h3 style={{ color: 'var(--primary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📸 메뉴 관리
          </h3>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '30px', border: '1px solid #222', marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.5rem' }}>메뉴판 사진을 업로드해 주세요</p>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {/* 중앙 버튼 복구 */}
            <button 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="btn-primary" 
              disabled={uploading}
              style={{ padding: '1.5rem 4rem', fontSize: '1.2rem', borderRadius: '20px', border: 'none', cursor: 'pointer' }}
            >
              {uploading ? '🔄 전송 중...' : '사진 선택 및 저장'}
            </button>
          </div>

          {menuImageUrl && (
            <div className="glass" style={{ padding: '2rem', borderRadius: '25px', background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
              <div style={{ width: '100%', minHeight: '300px', background: '#000', borderRadius: '20px', border: '1px dashed #444', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={menuImageUrl} alt="Current Menu" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 플로팅 버튼 복구 */}
      <div className="floating-btn-container">
        <button 
          onClick={() => fileInputRef.current && fileInputRef.current.click()} 
          disabled={uploading}
          className="btn-floating"
          style={{ 
            pointerEvents: 'auto',
            background: uploading ? '#333' : 'linear-gradient(135deg, var(--primary), var(--accent))',
            color: uploading ? '#666' : '#000',
            border: 'none',
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: '900',
            cursor: uploading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center', gap: '10px'
          }}
        >
          {uploading ? '🔄' : '💾'} {uploading ? '저장 중...' : '저장 하기'}
        </button>
      </div>

      {showToast && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 0, 0, 0.9)', color: 'var(--primary)', padding: '1rem 2rem', borderRadius: '15px', border: '1px solid var(--primary)', zIndex: 10001, animation: 'fadeInUp 0.3s ease-out', fontWeight: 'bold' }}>
          ✅ 수정사항이 저장되었습니다.
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @media (max-width: 800px) { }
      `}} />
    </>
  );
};

export default AdminMenu;
