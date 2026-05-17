import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Menu = () => {
  const [menuImages, setMenuImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const menuDoc = await getDoc(doc(db, 'content', 'menu_image'));
        if (menuDoc.exists()) {
          const data = menuDoc.data();
          const images = [];
          if (data.image1 || data.imageUrl) images.push(data.image1 || data.imageUrl);
          if (data.image2) images.push(data.image2);
          setMenuImages(images);
        }
      } catch (err) {
        console.error("Menu fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuData();
  }, []);

  if (loading) return <div className="container" style={{ minHeight: '100vh', background: '#000' }}></div>;

  return (
    <section className="container" style={{ padding: 'clamp(2.5rem, 8vw, 4rem) 1.2rem', minHeight: '100vh', textAlign: 'center' }}>
      
      <div className="menu-images-list" style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2.5rem' 
      }}>
        {menuImages.length > 0 ? (
          menuImages.map((url, index) => (
            <div key={index} className="glass" style={{ 
              padding: 'clamp(0.5rem, 2vw, 1rem)', 
              borderRadius: '30px', 
              border: '1px solid rgba(197, 160, 89, 0.1)', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)', 
              overflow: 'hidden',
              animation: `fadeIn 0.8s ease-out ${index * 0.2}s forwards`,
              opacity: 0
            }}>
              <img 
                src={url} 
                alt={`Menu Page ${index + 1}`} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: '20px',
                  display: 'block'
                }} 
              />
            </div>
          ))
        ) : (
          <div style={{ padding: '5rem' }}></div>
        )}
      </div>

      {/* 사용자의 요청에 따라 모든 화면(PC/모바일)에서 '메인으로 돌아가기' 버튼을 삭제했습니다. */}
      <div style={{ height: '6rem' }}></div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
};

export default Menu;
