import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { 
  collection, getDocs, setDoc, doc, deleteDoc, updateDoc,
  query, orderBy, serverTimestamp 
} from 'firebase/firestore';

const SuperAdmin = () => {
  const navigate = useNavigate();

  // 1. 보안용 비밀번호 상태 관리 (마스터 계정 비밀코드)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // 2. 대시보드 상태 관리
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // 3. 신규 가맹점 생성 폼 상태 관리 (사장님 비밀코드 추가)
  const [newStore, setNewStore] = useState({
    id: '',
    brandName: '',
    address: '',
    adminPasscode: '1234' // 디폴트 비밀코드
  });
  const [provisioning, setProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState('');

  // 보안 로그인 수행
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === '9999') {
      setIsAuthenticated(true);
      setAuthError('');
      fetchTenants();
    } else {
      setAuthError('❌ 비밀코드가 올바르지 않습니다. 다시 입력해 주세요.');
    }
  };

  // 모든 테넌트(가맹점) 목록 가져오기
  const fetchTenants = async () => {
    setLoadingTenants(true);
    try {
      const q = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTenants(list);

      if (list.length > 0 && !selectedTenantId) {
        setSelectedTenantId(list[0].id);
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
    } finally {
      setLoadingTenants(false);
    }
  };

  // 디폴트 테넌트 시딩 함수 (레거시 데모 복구용)
  const handleSeedLegacy = async () => {
    try {
      setLoadingTenants(true);
      await setDoc(doc(db, 'tenants', 'dine-event'), {
        brandName: '이벤트룰렛 다인점',
        address: '서울 강남구 테헤란로 427',
        adminPasscode: '1234',
        status: 'active',
        createdAt: serverTimestamp()
      });
      await fetchTenants();
      alert('기본 데모 가맹점(dine-event)이 성공적으로 생성되었습니다.');
    } catch (err) {
      console.error(err);
      alert('시딩 중 오류가 발생했습니다.');
    }
  };

  // 선택된 가맹점의 이벤트 응모 로그 가져오기
  useEffect(() => {
    if (!selectedTenantId || !isAuthenticated) return;
    const fetchEntries = async () => {
      setLoadingEntries(true);
      try {
        const q = query(collection(db, 'tenants', selectedTenantId, 'entries'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEntries(false);
      }
    };
    fetchEntries();
  }, [selectedTenantId, isAuthenticated]);

  // 가맹점 신규 발급 & 프로비저닝 (비밀코드 및 활성 상태 포함)
  const handleProvisionStore = async (e) => {
    e.preventDefault();
    if (!newStore.id || !newStore.brandName || !newStore.address || !newStore.adminPasscode) {
      alert('모든 가맹점 정보를 입력해 주세요.');
      return;
    }
    
    // 아이디 영문+대시 규격 필터링
    const idRegex = /^[a-z0-9-]+$/;
    if (!idRegex.test(newStore.id)) {
      alert('가맹점 영문 코드는 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.');
      return;
    }

    setProvisioning(true);
    setProvisionSuccess('');
    try {
      const tenantRef = doc(db, 'tenants', newStore.id);
      
      // 1. 마스터 테넌트 컬렉션 등록
      await setDoc(tenantRef, {
        brandName: newStore.brandName,
        address: newStore.address,
        adminPasscode: newStore.adminPasscode.trim(),
        status: 'active',
        createdAt: serverTimestamp()
      });

      // 2. 가맹점 기본 홈 설정 데이터 프로비저닝
      await setDoc(doc(db, `tenants/${newStore.id}/settings`, 'home'), {
        brandName: newStore.brandName,
        topLabel: 'HAPPY NEW YEAR & LUCKY DRAW',
        title: '대박 당첨의 주인공을 찾습니다!',
        subtitle: '행운의 골든 룰렛을 돌려 100% 즉석 당첨 혜택과 깜짝 경품을 획득하세요.',
        heroImage: ''
      });

      // 3. 가맹점 기본 매장 정보 세팅
      await setDoc(doc(db, `tenants/${newStore.id}/settings`, 'location'), {
        address: newStore.address,
        phone: '02-1234-5678',
        hours: '11:00 ~ 22:00 (연중무휴)'
      });

      // 4. 가맹점 기본 6대 룰렛 경품 즉시 시딩 (바로 룰렛 구동 가능)
      // 실제 테이블 모델 구조인 { name, totalCount, currentCount } 에 맞추어 데이터를 준비합니다.
      const defaultPrizes = [
        { name: '1등 샴페인 교환권 🍾', totalCount: 3, currentCount: 3 }, // 골드
        { name: '2등 시그니처 머그 ☕', totalCount: 10, currentCount: 10 }, // 실버
        { name: '3등 수제 케이크 🍰', totalCount: 15, currentCount: 15 }, // 브론즈
        { name: '4등 아메리카노 1잔 ☕', totalCount: 50, currentCount: 50 },
        { name: '5등 프리미엄 초콜릿 🍫', totalCount: 100, currentCount: 100 },
        { name: '다음 기회에 (꽝) 🎡', totalCount: 9999, currentCount: 9999 }
      ];

      // prizes 문서는 content 서브컬렉션 아래의 단일 문서(doc)로 저장되어야 하므로 4개의 경로 세그먼트를 가집니다.
      await setDoc(doc(db, `tenants/${newStore.id}/content`, 'prizes'), {
        list: defaultPrizes
      });

      setProvisionSuccess(`🎉 매장 [${newStore.brandName}] 이 성공적으로 프로비저닝되었습니다!`);
      setNewStore({ id: '', brandName: '', address: '', adminPasscode: '1234' });
      await fetchTenants();
    } catch (err) {
      console.error(err);
      alert('가맹점 프로비저닝 중 에러가 발생했습니다: ' + err.message);
    } finally {
      setProvisioning(false);
    }
  };

  // 특정 가맹점의 특정 응모 내역 삭제
  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('이 당첨 로그를 정말로 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'tenants', selectedTenantId, 'entries', entryId));
      setEntries(entries.filter(e => e.id !== entryId));
      alert('삭제 완료되었습니다.');
    } catch (err) {
      console.error(err);
      alert('삭제 중 실패했습니다.');
    }
  };

  // [NEW] 4단계: 매장 정지 및 운영 재개 토글 함수
  const handleToggleStoreStatus = async (targetTenant) => {
    const nextStatus = targetTenant.status === 'active' ? 'suspended' : 'active';
    const confirmMsg = nextStatus === 'suspended' 
      ? `[${targetTenant.brandName}] 매장의 룰렛 서비스를 즉각 '정지'하시겠습니까?\n고객과 관리자 페이지의 접속이 일체 차단됩니다.`
      : `[${targetTenant.brandName}] 매장의 룰렛 서비스를 정상 '운영 재개'하시겠습니까?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateDoc(doc(db, 'tenants', targetTenant.id), {
        status: nextStatus
      });
      alert('상태가 정상 변경되었습니다.');
      await fetchTenants();
    } catch (err) {
      console.error("Error toggling status:", err);
      alert('가맹점 상태 제어 도중 에러가 발생했습니다.');
    }
  };

  // [NEW] 4단계: 매장 데이터 완파/초기화 함수
  const handleResetStoreData = async (targetTenant) => {
    const doubleCheck = window.prompt(
      `⚠️ 경고! [${targetTenant.brandName}] 매장의 모든 당첨 로그를 일괄 삭제하고 기본 설정으로 포맷합니다.\n진행하시려면 가맹점 ID인 [ ${targetTenant.id} ] 을 입력창에 입력해 주세요.`
    );

    if (doubleCheck !== targetTenant.id) {
      alert('가맹점 ID가 다릅니다. 초기화를 취소합니다.');
      return;
    }

    try {
      setLoadingEntries(true);
      // 1. entries 하위 로그 전체 쿼리 및 일괄 삭제
      const entriesRef = collection(db, 'tenants', targetTenant.id, 'entries');
      const snap = await getDocs(entriesRef);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'tenants', targetTenant.id, 'entries', d.id));
      }

      // 2. 홈 설정 초기 템플릿 복구
      await setDoc(doc(db, `tenants/${targetTenant.id}/settings`, 'home'), {
        brandName: targetTenant.brandName,
        topLabel: 'HAPPY NEW YEAR & LUCKY DRAW',
        title: '대박 당첨의 주인공을 찾습니다!',
        subtitle: '행운의 골든 룰렛을 돌려 100% 즉석 당첨 혜택과 깜짝 경품을 획득하세요.',
        heroImage: ''
      });

      setEntries([]);
      alert(`🎉 [${targetTenant.brandName}] 가맹점의 이벤트 기록이 완벽하게 초기화되었습니다!`);
    } catch (err) {
      console.error("Reset store error:", err);
      alert('초기화 작업 중 문제가 발생했습니다: ' + err.message);
    } finally {
      setLoadingEntries(false);
    }
  };

  // ── 로그인 이전 뷰 (슈퍼관리자 패스코드 확인) ──
  if (!isAuthenticated) {
    return (
      <div style={{
        background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)',
        color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(197, 160, 89, 0.3)',
          borderRadius: '24px', padding: '3rem 2.5rem', width: '100%', maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎡</div>
          <h2 style={{
            fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #fff 40%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            이벤트룰렛 마스터
          </h2>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
            시스템 전체 가맹점 및 고객 내역을 제어하는 마스터 권한 영역입니다.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                슈퍼관리자 비밀코드
              </label>
              <input 
                type="password" 
                placeholder="마스터 비밀코드를 입력하세요" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{
                  width: '100%', padding: '1rem', background: '#000', border: '1px solid #333',
                  borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', textAlign: 'center',
                  letterSpacing: '5px'
                }}
                autoFocus
              />
            </div>
            
            {authError && (
              <p style={{ color: '#ff4d4d', fontSize: '0.8rem', margin: 0, fontWeight: 'bold' }}>
                {authError}
              </p>
            )}

            <button type="submit" style={{
              padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)',
              color: '#000', border: 'none', fontWeight: '900', fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 5px 20px rgba(248, 181, 0, 0.2)'
            }}>
              로그인 및 연결
            </button>
          </form>

          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'transparent', border: 'none', color: '#666', marginTop: '1.5rem',
              cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline'
            }}
          >
            홈페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ── 로그인 이후 메인 관리자 뷰 ──
  return (
    <div style={{
      background: '#0a0a0a', color: '#fff', minHeight: '100vh',
      fontFamily: "'Outfit', 'Inter', sans-serif", padding: '2rem 1.5rem'
    }}>
      
      {/* 상단 통합 제어바 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: '1.5rem', borderBottom: '1px solid #222', marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '2rem' }}>🎡</span>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, color: 'var(--primary)' }}>
              MASTER ADMIN CONTROL PANEL
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#666' }}>이벤트룰렛 시스템 마스터 콘솔</span>
          </div>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          style={{
            background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d',
            padding: '0.5rem 1.2rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'
          }}
        >
          안전 로그아웃
        </button>
      </div>

      {/* 시스템 종합 상태보드 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px', marginBottom: '3rem'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>입점 가맹점 수</span>
          <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>{tenants.length}개 점</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>선택된 매장 당첨 로그 수</span>
          <span style={{ fontSize: '2rem', fontWeight: '900', color: '#fff' }}>{entries.length}건</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '1.5rem', borderRadius: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>인프라 가동 상태</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '5px' }}>
            🟢 ACTIVE (정상)
          </span>
        </div>
      </div>

      {/* 2단 그리드 구성: 가맹점 개설 및 매장 목록 vs 당첨 로그 리스트 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '30px'
      }}>
        
        {/* 좌측: 신규 매장 추가 및 가맹점 제어 패널 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* 가맹점 신규 프로비저닝 (비밀코드 기능 보완) */}
          <div style={{
            background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(197, 160, 89, 0.2)',
            borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: 'var(--primary)', fontWeight: '900', marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚀</span> 원클릭 가맹점 신규 발급
            </h3>
            
            <form onSubmit={handleProvisionStore} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>가맹점 영문 ID 코드 (소문자, 숫자, 하이픈만)</label>
                <input 
                  type="text" 
                  placeholder="예: ediya, coffee-house" 
                  value={newStore.id}
                  onChange={(e) => setNewStore({...newStore, id: e.target.value.toLowerCase()})}
                  style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>가맹점명 (브랜드명)</label>
                  <input 
                    type="text" 
                    placeholder="예: 이디야 신림점" 
                    value={newStore.brandName}
                    onChange={(e) => setNewStore({...newStore, brandName: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>사장님 비밀코드</label>
                  <input 
                    type="text" 
                    placeholder="1234" 
                    value={newStore.adminPasscode}
                    onChange={(e) => setNewStore({...newStore, adminPasscode: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>가맹점 위치 (주소)</label>
                <input 
                  type="text" 
                  placeholder="예: 서울 관악구 신림로 340" 
                  value={newStore.address}
                  onChange={(e) => setNewStore({...newStore, address: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              {provisionSuccess && (
                <p style={{ color: '#4caf50', fontSize: '0.85rem', fontWeight: 'bold', margin: 0 }}>
                  {provisionSuccess}
                </p>
              )}

              <button 
                type="submit" 
                disabled={provisioning}
                style={{
                  width: '100%', padding: '0.9rem', background: 'var(--primary)', color: '#000',
                  border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer',
                  opacity: provisioning ? 0.6 : 1
                }}
              >
                {provisioning ? '🔄 가맹점 구성 인프라 구축 중...' : '즉시 가맹점 개설 및 DB 구성'}
              </button>
            </form>
          </div>

          {/* 등록된 가맹점 관리 목록 (정지/초기화 버튼 연동) */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid #222',
            borderRadius: '20px', padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#fff', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> 입점 매장 리스트
              </h3>
              {tenants.length === 0 && (
                <button onClick={handleSeedLegacy} style={{ background: '#333', border: 'none', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  기본 데모 추가 (Seed)
                </button>
              )}
            </div>

            {loadingTenants ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>가맹점 데이터 목록 불러오는 중...</div>
            ) : tenants.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>
                현재 입점 가맹점이 없습니다.<br/>위 가맹점 발급 폼으로 매장을 개설해 주세요.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {tenants.map(t => (
                  <div 
                    key={t.id} 
                    style={{
                      background: selectedTenantId === t.id ? 'rgba(197, 160, 89, 0.05)' : '#000',
                      border: selectedTenantId === t.id ? '1px solid var(--primary)' : '1px solid #222',
                      borderRadius: '12px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                      opacity: t.status === 'suspended' ? 0.6 : 1
                    }}
                    onClick={() => setSelectedTenantId(t.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold', color: selectedTenantId === t.id ? 'var(--primary)' : '#fff' }}>
                        {t.brandName} {t.status === 'suspended' && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginLeft: '5px' }}>(🔴 정지됨)</span>}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#555', background: '#111', padding: '2px 6px', borderRadius: '4px' }}>
                        {t.id}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#888', display: 'block' }}>
                      {t.address}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block', marginTop: '5px' }}>
                      🔑 사장님 비밀코드: {t.adminPasscode || '1234'}
                    </span>
                    
                    {/* 바로가기 버튼 세트 */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <a 
                        href={`/${t.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          flex: 1, textDecoration: 'none', background: '#222', color: '#fff', fontSize: '0.75rem',
                          padding: '4px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        사용자화면 ➔
                      </a>
                      <a 
                        href={`/${t.id}/admin`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          flex: 1, textDecoration: 'none', background: 'rgba(197, 160, 89, 0.1)', color: 'var(--primary)',
                          border: '1px solid rgba(197, 160, 89, 0.2)', fontSize: '0.75rem', padding: '4px', borderRadius: '6px',
                          textAlign: 'center', fontWeight: 'bold'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        관리센터 🛠️
                      </a>
                    </div>

                    {/* [NEW] 4단계: 마스터 제어 버튼 영역 (정지 및 초기화) */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #222' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStoreStatus(t); }}
                        style={{
                          flex: 1, padding: '4px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px',
                          background: t.status === 'suspended' ? '#4caf50' : '#d32f2f',
                          color: '#fff', border: 'none', cursor: 'pointer'
                        }}
                      >
                        {t.status === 'suspended' ? '운영 재개 🟢' : '서비스 정지 🔴'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResetStoreData(t); }}
                        style={{
                          flex: 1, padding: '4px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px',
                          background: 'transparent', border: '1px solid #d32f2f', color: '#d32f2f', cursor: 'pointer'
                        }}
                      >
                        ⚠️ 데이터 초기화
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 우측: 선택한 가맹점의 응모 및 당첨 현황 로그 모니터링 */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid #222',
          borderRadius: '20px', padding: '2rem'
        }}>
          <h3 style={{ color: '#fff', fontWeight: '900', marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📝</span> 실시간 당첨 및 응모 내역 제어
          </h3>

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>선택된 매장 필터:</span>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1rem' }}>
              {tenants.find(t => t.id === selectedTenantId)?.brandName || selectedTenantId || '없음'}
            </span>
          </div>

          {loadingEntries ? (
            <div style={{ color: '#666', textAlign: 'center', padding: '3rem' }}>해당 매장 당첨 데이터 실시간 수신 중...</div>
          ) : entries.length === 0 ? (
            <div style={{ color: '#555', textAlign: 'center', padding: '4rem', fontSize: '0.9rem' }}>
              당첨 및 응모 내역이 존재하지 않습니다.<br/>룰렛을 통해 고객 응모가 진행되면 로그가 자동 적재됩니다.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333', color: '#666' }}>
                    <th style={{ padding: '8px' }}>연락처 (ID)</th>
                    <th style={{ padding: '8px' }}>획득 상품</th>
                    <th style={{ padding: '8px' }}>일시</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>동작</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => {
                    const dateStr = entry.createdAt?.seconds 
                      ? new Date(entry.createdAt.seconds * 1000).toLocaleString() 
                      : '대기 중';
                    return (
                      <tr key={entry.id} style={{ borderBottom: '1px solid #222', color: '#ddd' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>{entry.phone}</td>
                        <td style={{ padding: '10px 8px', color: 'var(--primary)' }}>{entry.prizeName || entry.prize}</td>
                        <td style={{ padding: '10px 8px', fontSize: '0.75rem', color: '#888' }}>{dateStr}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDeleteEntry(entry.id)}
                            style={{
                              background: 'transparent', border: 'none', color: '#ff4d4d',
                              cursor: 'pointer', fontSize: '1rem'
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default SuperAdmin;
