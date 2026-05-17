import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyIntro = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🔒',
      title: '철저한 테넌트 데이터 격리',
      desc: '각 가맹점의 이벤트 설정, 경품 재고, 고객 데이터가 엄격하게 독립 가동되어 완벽한 보안을 자랑합니다.'
    },
    {
      icon: '🎁',
      title: '실시간 경품 재고 차감',
      desc: '룰렛 당첨 시 Firestore를 통해 실시간으로 재고가 1씩 즉각 차감되며, 오버드로우 및 다중 당첨 오류를 방지합니다.'
    },
    {
      icon: '💬',
      title: '지능형 고객 문자 마케팅',
      desc: '현장에서 수집된 고객 데이터에 맞춤형 당첨 및 감사 문자를 실시간으로 필터링하여 일괄 전송할 수 있습니다.'
    },
    {
      icon: '📱',
      title: '풀스크린 모바일 오피스',
      desc: '사장님이 현장에서 서빙을 하시며 스마트폰 클릭 몇 번만으로 공지 등록, 경품 변경, 룰렛 제어를 하실 수 있습니다.'
    }
  ];

  const pricing = [
    {
      name: '스타터 (Starter)',
      price: '월 29,000원',
      features: ['1개 매장 가동', '실시간 경품 룰렛', '수동 경품 관리', '기본 고객 응모 로그'],
      popular: false
    },
    {
      name: '프로 골드 (Pro Gold)',
      price: '월 59,000원',
      features: ['실시간 문자 방송 기능', '공지사항 및 템플릿 관리', '고광택 골드 프리미엄 테마', '실시간 응모 청소 툴', '24시간 카톡 기술 지원'],
      popular: true
    },
    {
      name: '엔터프라이즈 (Enterprise)',
      price: '별도 문의',
      features: ['무제한 서브 테넌트', '자체 전용 도메인 매핑', '고객 CRM 외부 연동 API', '전담 엔지니어 밀착 케어'],
      popular: false
    }
  ];

  const demoStores = [
    { id: 'dine-event', name: '이벤트룰렛 다인점 🍽️', desc: '고품격 다이닝 테마의 레거시 데모 스토어' },
    { id: 'starbucks', name: '스타벅스 강남점 ☕', desc: '커피쿠폰 및 프리미엄 MD 위주 기획 스토어' },
    { id: 'bbq', name: 'BBQ 치킨 명동점 🍗', desc: '치킨 기프티콘 및 사이드 메뉴 교환권 스토어' }
  ];

  return (
    <div className="company-intro-container" style={{
      background: 'radial-gradient(circle at 50% 0%, #151515 0%, #050505 100%)',
      color: '#fff',
      minHeight: '100vh',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      paddingBottom: '100px'
    }}>
      
      {/* ── 상단 네비게이션 바 ── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎡</span>
          <span style={{
            fontSize: '1.3rem', fontWeight: '900', letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #fff 30%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            이벤트룰렛
          </span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => navigate('/master-admin')}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197, 160, 89, 0.4)',
              color: 'var(--primary)', padding: '0.5rem 1.2rem', borderRadius: '50px',
              fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s'
            }}
            className="super-admin-btn"
          >
            🔑 슈퍼관리자
          </button>
        </div>
      </nav>

      {/* ── 히어로 섹션 ── */}
      <section style={{ textAlign: 'center', padding: '6rem 1rem 4rem 1rem', position: 'relative' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(197, 160, 89, 0.1)',
          border: '1px solid var(--primary)', borderRadius: '30px',
          padding: '4px 16px', color: 'var(--primary)', fontSize: '0.8rem',
          fontWeight: '900', letterSpacing: '2px', marginBottom: '2rem'
        }}>
          오프라인 매장 이벤트 플랫폼의 혁명
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2rem, 8vw, 4.5rem)', fontWeight: '900',
          lineHeight: 1.15, letterSpacing: '-2px', margin: '0 auto 1.5rem auto',
          maxWidth: '900px', wordBreak: 'keep-all'
        }}>
          매장 고객 참여를 극대화하는<br/>
          <span style={{
            background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            최고급 스마트 룰렛 솔루션
          </span>
        </h1>

        <p style={{
          color: '#aaa', fontSize: 'clamp(0.95rem, 2.5vw, 1.25rem)',
          maxWidth: '650px', margin: '0 auto 3rem auto', lineHeight: 1.6,
          wordBreak: 'keep-all'
        }}>
          실시간 경품 한도 설정, 안전한 데이터 격리, 가맹점 전용 모바일 오피스까지. 
          오프라인 매장의 고객 유입과 재방문율을 폭발적으로 증가시킵니다.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/dine-event')}
            style={{
              background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)',
              color: '#000', border: 'none', padding: '1rem 2.5rem',
              borderRadius: '50px', fontSize: '1.05rem', fontWeight: '900',
              cursor: 'pointer', boxShadow: '0 10px 30px rgba(248, 181, 0, 0.3)'
            }}
          >
            체험판 매장 입장하기 ✨
          </button>
          <button 
            onClick={() => navigate('/master-admin')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2.5rem',
              borderRadius: '50px', fontSize: '1.05rem', fontWeight: 'bold',
              cursor: 'pointer', backdropFilter: 'blur(5px)'
            }}
          >
            슈퍼관리자 대시보드 🔑
          </button>
        </div>
      </section>

      {/* ── 데모 매장 포털 링크 ── */}
      <section style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <h3 style={{
          color: 'var(--primary)', fontSize: '1.4rem', fontWeight: '900',
          textAlign: 'center', marginBottom: '2rem', letterSpacing: '-0.5px'
        }}>
          🎪 실시간 입점 매장 데모 둘러보기
        </h3>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {demoStores.map(store => (
            <div 
              key={store.id}
              onClick={() => navigate(`/${store.id}`)}
              style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px', padding: '2rem', cursor: 'pointer',
                transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
              }}
              className="demo-store-card"
            >
              <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {store.name}
              </h4>
              <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {store.desc}
              </p>
              <div style={{
                marginTop: '1.5rem', display: 'flex', alignItems: 'center',
                gap: '5px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold'
              }}>
                방문하기 ➔
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 서비스 특장점 섹션 ── */}
      <section style={{ maxWidth: '1100px', margin: '6rem auto 4rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
            가맹점과 사장님을 위한 독보적인 기능
          </h2>
          <p style={{ color: '#888', fontSize: '1rem' }}>
            오프라인 매장 이벤트 룰렛 솔루션의 고품격 스펙 시트를 확인해 보세요.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '25px'
        }}>
          {features.map((feat, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(197, 160, 89, 0.1)',
              borderRadius: '24px', padding: '2.2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(5px)'
            }} className="feature-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1.2rem' }}>{feat.icon}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.8rem' }}>
                {feat.title}
              </h3>
              <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, wordBreak: 'keep-all' }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 요금제 섹션 ── */}
      <section style={{ maxWidth: '1000px', margin: '6rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
            합리적인 맞춤형 요금 플랜
          </h2>
          <p style={{ color: '#888', fontSize: '1rem' }}>
            매장 규모에 맞춰 가장 효율적인 플랜을 골라보세요.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px', alignItems: 'stretch'
        }}>
          {pricing.map((plan, idx) => (
            <div key={idx} style={{
              background: plan.popular ? 'rgba(197, 160, 89, 0.07)' : 'rgba(255,255,255,0.02)',
              border: plan.popular ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
              borderRadius: '28px', padding: '2.5rem 2rem', display: 'flex',
              flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden'
            }} className="pricing-card">
              
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '15px', right: '-35px',
                  background: 'var(--primary)', color: '#000', fontSize: '0.65rem',
                  fontWeight: '900', padding: '6px 35px', transform: 'rotate(45deg)'
                }}>
                  BEST CHOICE
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>
                  {plan.name}
                </h3>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '2rem' }}>
                  {plan.price}
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#ccc' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button style={{
                width: '100%', padding: '1rem', marginTop: '2.5rem',
                background: plan.popular ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: plan.popular ? '#000' : '#fff', border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '15px', fontSize: '0.95rem', fontWeight: 'bold',
                cursor: 'pointer', transition: 'all 0.3s'
              }}>
                플랜 시작하기
              </button>

            </div>
          ))}
        </div>
      </section>

      {/* ── 인라인 글로벌 CSS 정의 ── */}
      <style dangerouslySetInnerHTML={{__html: `
        .super-admin-btn:hover {
          background: var(--primary) !important;
          color: #000 !important;
          box-shadow: 0 0 15px rgba(197, 160, 89, 0.4);
        }
        .demo-store-card:hover {
          transform: translateY(-8px);
          background: rgba(197, 160, 89, 0.04) !important;
          border: 1px solid rgba(197, 160, 89, 0.3) !important;
          box-shadow: 0 15px 40px rgba(0,0,0,0.5);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          border: 1px solid var(--primary) !important;
          box-shadow: 0 15px 35px rgba(197, 160, 89, 0.1) !important;
        }
        .pricing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(0,0,0,0.6);
        }
      `}} />

    </div>
  );
};

export default CompanyIntro;
