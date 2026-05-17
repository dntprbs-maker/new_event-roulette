import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection } from 'firebase/firestore';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const { tenantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [tenantConfig, setTenantConfig] = useState({
    brandName: '이벤트룰렛',
    brandNameKr: '이벤트룰렛',
    themeColor: '#E11D48', // 기본 테마 로즈 칼라
  });

  const activeTenant = tenantId || 'dine-event';

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const tenantHomeRef = doc(db, 'tenants', activeTenant, 'settings', 'home');
        const tenantHomeDoc = await getDoc(tenantHomeRef);
        
        if (tenantHomeDoc.exists()) {
          setTenantConfig(tenantHomeDoc.data());
        } else {
          const defaultHomeRef = doc(db, 'settings', 'home');
          const defaultHomeDoc = await getDoc(defaultHomeRef);
          if (defaultHomeDoc.exists()) {
            setTenantConfig(defaultHomeDoc.data());
          }
        }
      } catch (err) {
        console.error('Error fetching tenant config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [tenantId]);

  // 스마트 헬퍼 1: 테넌트 맞춤형 단일 문서(Doc) 참조 반환
  const getDocRef = (collectionName, docName) => {
    return doc(db, 'tenants', activeTenant, collectionName, docName);
  };

  // 스마트 헬퍼 2: 테넌트 맞춤형 컬렉션(Collection) 참조 반환
  const getColRef = (collectionName) => {
    return collection(db, 'tenants', activeTenant, collectionName);
  };

  // 스마트 헬퍼 3: 조회용 폴백 (문서 읽기)
  const fetchDocWithFallback = async (collectionName, docName) => {
    const tenantRef = doc(db, 'tenants', activeTenant, collectionName, docName);
    const tenantSnap = await getDoc(tenantRef);
    if (tenantSnap.exists()) {
      return tenantSnap;
    }
    // 폴백: 기존 단일 매장 경로
    const fallbackRef = doc(db, collectionName, docName);
    return await getDoc(fallbackRef);
  };

  return (
    <TenantContext.Provider value={{ 
      tenantId: activeTenant, 
      tenantConfig, 
      loading,
      getDocRef,
      getColRef,
      fetchDocWithFallback
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
