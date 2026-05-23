import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 컴포넌트명을 CompanyIntro로 수정하여 통합 진행
const CompanyIntro = () => {
  const navigate = useNavigate();

  // ── 상태 관리 ──
  const [activeFaq, setActiveFaq] = useState(null); // FAQ 아코디언 열림/닫힘 인덱스
  const [showPrizeModal, setShowPrizeModal] = useState(false); // 가상 룰렛 당첨 팝업 모달
  const [isSpinning, setIsSpinning] = useState(false); // 가상 룰렛 회전 상태
  const [spinAngle, setSpinAngle] = useState(0); // 가상 룰렛 회전 각도
  const [selectedPrize, setSelectedPrize] = useState(null); // 가상 룰렛 선택된 당첨 경품
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('customer'); // 쇼케이스 탭 ('customer', 'store', 'dashboard')
  const [totalEntries, setTotalEntries] = useState(482927); // 실시간 플랫폼 누적 응모 시뮬레이션 카운터

  // 가상 룰렛 경품 섹터 설정 (3D 스타일 시뮬레이션용)
  const miniPrizes = [
    { name: '🥇 1등 한우 세트', color: '#ffb53f', isWin: true },
    { name: '🍀 다음 기회에', color: '#1a1a1a', isWin: false },
    { name: '☕ 스타벅스 커피', color: '#c5a059', isWin: true },
    { name: '🍟 맛있는 사이드', color: '#2a2a2a', isWin: true },
    { name: '🎁 사이다 서비스', color: '#c5a059', isWin: true },
    { name: '🍀 꽝', color: '#111111', isWin: false },
  ];

  // 1. 실시간 누적 응모 카운팅 매초 소폭 상승 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalEntries(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // 2. 가상 룰렛 구동 로직
  const startVirtualSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    // 최소 5바퀴(1800도) 이상 회전 후 임의 각도 지정
    const randomOffset = Math.floor(Math.random() * 360);
    const finalRotation = spinAngle + 2160 + randomOffset;
    setSpinAngle(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      // 화살표가 가리키는 회전 각도 기준 섹터 매핑 (섹터당 60도)
      const normalized = (360 - (finalRotation % 360) + 90) % 360;
      const index = Math.floor(normalized / 60) % 6;
      const resultPrize = miniPrizes[index];

      setSelectedPrize(resultPrize);
      setShowPrizeModal(true);
    }, 4000); // 4초 후 부드럽게 감속 멈춤
  };

  // 업종별 데모 / 활용 사례 데이터
  const caseStudies = [
    {
      title: '🍽️ 다이닝 & 외식 매장',
      goal: '고객 단가의 상승과 대기 시간의 지루함 해결!',
      prize: '1등 한우 모듬 세트, 사이드 무료 시식권 등',
      desc: '대기 시간이 다소 긴 고품격 다이닝 매장에 배치하여 고객의 지루함을 없애고, 주문 금액대별 응모 기회를 부여해 자연스럽게 테이블 단가를 끌어올립니다.',
      themeColor: '#c5a059'
    },
    {
      title: '☕ 베이커리 & 카페',
      goal: '테이크아웃 단골 고객의 방문 주기 폭발적 단축!',
      prize: '무료 아메리카노 교환권, 브랜드 텀블러 등',
      desc: '스탬프 적립보다 시각적 효과가 큰 즉석 룰렛 이벤트를 통해 단골 확보가 어려운 오피스 카페 상권에서 독보적인 유인 효과와 단골 락인을 이끌어냅니다.',
      themeColor: '#34d399'
    },
    {
      title: '🍗 프랜차이즈 & 치킨 매장',
      goal: '배달 고객을 매장 홀 유입 단골 고객으로 전환!',
      prize: '치킨 모바일 상품권, 크림 생맥주 무료권 등',
      desc: '배달 패키지에 동봉된 QR 코드를 활용하여 응모하게 한 뒤, 당첨된 룰렛 쿠폰을 매장 방문 시 즉시 사용하게 유도하여 홀 활성화 매출을 증폭시킵니다.',
      themeColor: '#fb923c'
    },
    {
      title: '🎪 팝업스토어 & 행사장',
      goal: '현장 집객 효과의 극대화와 잠재 고객 DB 수집!',
      prize: '브랜드 리미티드 굿즈, 스페셜 할인 바우처 등',
      desc: '폭발적으로 밀려드는 대기 고객의 트래픽을 안전하게 제어하고, 당첨 확률의 정밀 조정 및 소진 한도 제어를 통해 완벽한 행사 운영 리스크 헷지를 보장합니다.',
      themeColor: '#a78bfa'
    }
  ];

  // 6대 핵심 기능
  const coreFeatures = [
    {
      icon: '🔒',
      badge: '보안 격리 보장',
      title: '가맹점별 독립 데이터 운영',
      desc: '각 매장의 이벤트 정보, 경품 재고 수량, 당첨자 개인 정보 등이 고유의 tenantId로 암호화 격리 저장되므로 가맹점 간 데이터 무단 침범을 원천 격리합니다.'
    },
    {
      icon: '🎁',
      badge: '트랜지션 재고 제어',
      title: '실시간 경품 재고 실시간 차감',
      desc: '룰렛 회전 완료 시점 Firestore 트랜잭션이 작동하여 실시간으로 수량을 1씩 즉각 차감하며, 남은 재고가 0이 되면 자동으로 꽝 처리되어 당첨 오류를 방지합니다.'
    },
    {
      icon: '📱',
      badge: '추가 앱 무설치',
      title: '무필터 점주용 모바일 오피스',
      desc: '사장님과 고객 모두 귀찮은 모바일 앱을 다운로드할 필요가 전혀 없습니다. 모바일 브라우저에서 사장님 전용 관리 화면에 접속해 100% 무결한 제어가 가능합니다.'
    },
    {
      icon: '💬',
      badge: '마케팅 비용 0원',
      title: '메시지 발송 수수료 완전 제로',
      desc: '통합 수집된 당첨자 휴대폰 목록을 사장님 스마트폰 기본 SMS 전송 환경으로 즉각 매핑하여 직발송하므로, 비싼 대량 발송 대행업체 수수료를 100% 절감합니다.'
    },
    {
      icon: '📋',
      badge: '실시간 편집 지원',
      title: '공지사항 & 이벤트 템플릿 관리',
      desc: '매장의 새로운 소식이나 룰렛 이벤트 문구를 스마트폰 클릭 몇 번으로 즉시 수정할 수 있으며, 수정 즉시 고객들이 접속하는 이벤트 화면에 1초 만에 자동 배포됩니다.'
    },
    {
      icon: '📊',
      badge: '고품격 보고서',
      title: '실시간 응모 로그 및 통계 리포트',
      desc: '어떤 고객이 몇 시 몇 분에 응모했고 어떤 경품에 당첨되었는지 모든 데이터를 실시간 타임라인 로그로 확인 가능하며 매장의 마케팅 인사이트 지표로 활용할 수 있습니다.'
    }
  ];

  // FAQ 6대 질문 세트
  const faqList = [
    {
      q: 'Q. 마케팅 문자 발송 비용은 어떻게 처리되나요?',
      a: '이벤트룰렛은 비싼 문자 대량 발송 중계 서버를 거치지 않습니다. 점주 관리실에서 원하는 당첨 그룹을 필터링한 후, 사장님 스마트폰의 기본 SMS 앱 전송 환경으로 번호 목록과 내용을 전달합니다. 따라서 추가적인 대행 수수료가 전혀 없으며, 사장님 휴대폰 요금제의 기본 무료 문자 범위 내에서 발송할 시 마케팅 수수료 0원으로 전액 무료 마케팅이 가능합니다.'
    },
    {
      q: 'Q. 여러 매장이나 프랜차이즈 지점을 한 번에 운영할 수 있나요?',
      a: '네, 가능합니다. 프랜차이즈 본사나 다수 지점을 소유하신 사장님들을 위해 Enterprise 플랜을 준비해 두었습니다. 마스터 비밀코드(기본 9999)를 통해 전체 매장 현황을 스위칭 제어할 수 있어, 본사 브랜드 관리 및 지점별 룰렛 운영 지표를 한눈에 모니터링하기에 가장 완벽한 대시보드를 제공합니다.'
    },
    {
      q: 'Q. 정말 가맹점 간 데이터 격리가 안전하게 보장되나요?',
      a: '네, 이벤트룰렛은 검증된 멀티 테넌트(Multi-tenancy) 클라우드 데이터 구조를 채택했습니다. 매장별 고유 ID를 기준으로 데이터베이스의 모든 경로가 수평으로 엄격히 분리 격리 가동되므로, 다른 지점 사장님이 본인의 대시보드 외에 다른 매장의 고객 개인정보나 템플릿, 경품 설정을 조회하거나 편집할 확률은 물리적으로 원천 봉쇄되어 있습니다.'
    },
    {
      q: 'Q. 경품이 조기 소진되면 현장에서 사고가 나지 않을까요?',
      a: '이벤트룰렛은 강력한 실시간 재고 제어 트랜잭션을 실행합니다. 만약 설정된 경품(예: 1등 한우)의 수량이 소진되어 0이 되는 즉시, 시스템이 실시간으로 상태를 감지하여 룰렛 판 당첨 확률 연산에서 해당 경품을 즉시 완전 제외합니다. 이후 모든 당첨 시도는 자동으로 안전 수량이나 꽝/다음 기회에로 분기되므로 현장에서의 과다 당첨 지급 사고 우려가 제로입니다.'
    },
    {
      q: 'Q. 도입 신청 후 실제 룰렛 가동까지 세팅 시간은 얼마나 걸리나요?',
      a: '회원가입 후 최초 설정 완료까지 단 5분이면 충분합니다. 관리자 센터에서 상호명과 매장 브랜드 로고를 등록하고, 준비하신 경품 수량과 대표 당첨 확률을 입력하시면 해당 매장 고유의 고객용 응모 URL과 사장님용 모바일 오피스가 즉시 생성되어 그 즉시 QR 코드를 뽑아 현장에 바로 배치하실 수 있습니다.'
    },
    {
      q: 'Q. 이벤트가 완전히 종료된 후 응모자 데이터를 엑셀로 받을 수 있나요?',
      a: '네, 사장님 관리 센터의 \'고객 관리\' 메뉴를 통해 기간별 전체 응모자 정보 및 당첨 결과를 안전하게 모니터링할 수 있습니다. (※ 엑셀 다운로드 다운로드 버튼과 기능은 주인님의 서비스 개발 계획에 따라 화면 UI에 아름답게 주석 보존 처리되어 있어, 차후 고도화 배포 시 즉각 안전하게 활성화됩니다.)'
    }
  ];

  return (
    <div className="premium-saas-landing" style={{
      background: 'radial-gradient(circle at 50% 0%, #171717 0%, #050505 100%)',
      color: '#fff',
      minHeight: '100vh',
      fontFamily: "'Outfit', 'Inter', 'Noto Sans KR', system-ui, sans-serif",
      paddingBottom: '0px',
      overflowX: 'hidden'
    }}>

      {/* ── 가상 룰렛 축하 모달 ── */}
      {showPrizeModal && selectedPrize && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setShowPrizeModal(false)}>
          <div style={{
            background: '#111', borderRadius: '30px',
            border: selectedPrize.isWin ? '2px solid #c5a059' : '1px solid #333',
            boxShadow: '0 25px 80px rgba(0,0,0,0.9)',
            padding: '2.5rem 2rem', textAlign: 'center',
            width: '100%', maxWidth: '345px',
            animation: 'popupZoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {selectedPrize.isWin ? '🏆' : '🍀'}
            </div>
            <h3 style={{
              color: selectedPrize.isWin ? '#c5a059' : '#aaa',
              fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.8rem'
            }}>
              {selectedPrize.isWin ? '미니 시뮬레이션 당첨!' : '다음 기회에!'}
            </h3>
            <p style={{
              color: '#fff', fontSize: '1.05rem', fontWeight: 'bold',
              background: 'rgba(255,255,255,0.03)', padding: '10px 15px',
              borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '1.5rem', display: 'inline-block'
            }}>
              {selectedPrize.name}
            </p>
            <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1.8rem' }}>
              ※ 본 룰렛은 마케팅 시뮬레이션입니다.<br/>실제 매장 데모에 입장하여 경품 재고와 Firestore 실시간 연동을 체험해 보세요!
            </p>
            <button
              onClick={() => setShowPrizeModal(false)}
              className="premium-gold-button"
              style={{
                width: '100%', padding: '0.85rem', borderRadius: '12px', fontSize: '0.9rem', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)', color: '#000', fontWeight: 'bold'
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ── [1] 헤더 (Sticky Header) ── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.03)',
        backdropFilter: 'blur(15px)', position: 'sticky', top: 0, zIndex: 1000,
        background: 'rgba(5, 5, 5, 0.75)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <span style={{ fontSize: '1.8rem' }}>🎡</span>
          <span style={{
            fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1.5px',
            background: 'linear-gradient(135deg, #fff 40%, #c5a059 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            이벤트룰렛
          </span>
        </div>
        
        {/* 내비게이션 링크 */}
        <div style={{ display: 'flex', gap: '2rem' }} className="header-links">
          {['특장점', '활용사례', '핵심기능', '요금제', 'FAQ'].map((menu, i) => {
            const targets = ['#features', '#cases', '#functions', '#pricing', '#faq'];
            return (
              <a 
                key={i} 
                href={targets[i]} 
                style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}
              >
                {menu}
              </a>
            );
          })}
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/admin')}
            style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(197, 160, 89, 0.4)',
              color: '#c5a059', padding: '0.5rem 1.2rem', borderRadius: '50px',
              fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s'
            }}
            className="super-admin-btn"
          >
            🔑 관리자 화면 보기
          </button>
          <a
            href="mailto:contact@dntprbs-roulette.com"
            style={{
              background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)',
              color: '#000', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '50px',
              fontSize: '0.82rem', fontWeight: '900', cursor: 'pointer', textDecoration: 'none', display: 'inline-block'
            }}
          >
            📩 도입 문의
          </a>
        </div>
      </nav>

      {/* ── [2] 히어로 섹션 (Hero & Product Showcase Mockup) ── */}
      <section style={{
        maxWidth: '1240px', margin: '0 auto',
        padding: '5rem 2rem 4rem 2rem',
        display: 'grid', gridTemplateColumns: '1.1fr 1fr',
        gap: '50px', alignItems: 'center'
      }} className="hero-grid">
        
        {/* 히어로 왼쪽: 텍스트 정보 */}
        <div style={{ textAlign: 'left' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(197, 160, 89, 0.08)',
            border: '1px solid #c5a059', borderRadius: '30px',
            padding: '5px 15px', color: '#c5a059', fontSize: '0.8rem',
            fontWeight: '900', letterSpacing: '2px', marginBottom: '2rem',
            boxShadow: '0 0 20px rgba(197,160,89,0.1)'
          }}>
            오프라인 매장 전용 스마트 마케팅 엔진
          </div>
          
          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', fontWeight: '900',
            lineHeight: 1.2, letterSpacing: '-2px', marginBottom: '1.5rem',
            wordBreak: 'keep-all', color: '#fff'
          }}>
            방문 고객의 발걸음을<br/>
            <span style={{
              background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              머물게 하는 가장 완벽한 방법
            </span>
          </h1>

          <p style={{
            color: '#aaa', fontSize: 'clamp(0.95rem, 1.8vw, 1.12rem)',
            marginBottom: '2.5rem', lineHeight: 1.7, wordBreak: 'keep-all',
            maxWidth: '580px'
          }}>
            실시간 경품 한도 설정, 완벽한 테넌트 보안 격리, 그리고 수수료 0원의 고객 단체 문자 발송까지. 사장님 스마트폰 하나로 오프라인 매장의 고객 유입과 단골 확보를 실현하세요.
          </p>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/event')}
              style={{
                background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)',
                color: '#000', border: 'none', padding: '1.1rem 2.5rem',
                borderRadius: '50px', fontSize: '1rem', fontWeight: '900',
                cursor: 'pointer', boxShadow: '0 10px 30px rgba(248, 181, 0, 0.3)',
                transition: 'all 0.3s'
              }}
              className="premium-gold-button"
            >
              🎪 데모 매장 체험하기
            </button>
            <button 
              onClick={() => navigate('/admin')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '1.1rem 2.2rem',
                borderRadius: '50px', fontSize: '1rem', fontWeight: 'bold',
                cursor: 'pointer', backdropFilter: 'blur(5px)', transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              🔑 관리자 화면 보기
            </button>
          </div>
        </div>

        {/* 히어로 오른쪽: 입체감 있는 3D 스타일 가상 룰렛 및 점주 UI 카드 레이아웃 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%', position: 'relative' }}>
          
          {/* 가상 룰렛 쇼케이스 카드 */}
          <div style={{
            background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(197,160,89,0.2)',
            borderRadius: '35px', padding: '2.5rem 2rem', width: '100%', maxWidth: '440px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 30px rgba(197,160,89,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'
          }}>
            <div style={{
              width: '210px', height: '210px', borderRadius: '50%',
              border: '6px solid #c5a059', position: 'relative',
              background: '#111', overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8), 0 0 20px rgba(197,160,89,0.2)',
              transform: `rotate(${spinAngle}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.35, 1)' : 'none'
            }}>
              {miniPrizes.map((p, idx) => (
                <div key={idx} style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${idx * 60}deg)`, transformOrigin: '50% 50%' }}>
                  <div style={{ position: 'absolute', left: '50%', top: 0, width: '2px', height: '50%', background: 'rgba(197,160,89,0.3)', transformOrigin: '0% 100%' }} />
                  <div style={{
                    position: 'absolute', left: '50%', top: '24px',
                    transform: 'translateX(-50%) rotate(30deg)', transformOrigin: '50% 50%',
                    writingMode: 'vertical-rl', color: '#fff', fontSize: '0.68rem', fontWeight: '900',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}>{p.name.split(' ').slice(1).join(' ')}</div>
                </div>
              ))}
              <div style={{ position: 'absolute', width: '26px', height: '26px', borderRadius: '50%', background: '#000', border: '3px solid #c5a059', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }} />
            </div>

            {/* 고정 인디케이터 화살표 */}
            <div style={{
              width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '20px solid #ff4d4d',
              position: 'absolute', top: '58px', zIndex: 20, filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.5))'
            }} />

            <button
              onClick={startVirtualSpin}
              disabled={isSpinning}
              style={{
                marginTop: '1.8rem', padding: '0.75rem 2rem', borderRadius: '25px', fontSize: '0.9rem', fontWeight: '900', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)', color: '#000'
              }}
            >
              {isSpinning ? '⏳ 감속 회전 중...' : '🎡 가상 룰렛 체험하기'}
            </button>
          </div>

          {/* 서브 카드 1: 점주 대시보드 미니 피드백 */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px', padding: '1.2rem 1.8rem', width: '100%', maxWidth: '440px',
            display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#ffb53f', fontWeight: '900', letterSpacing: '0.05em' }}>🔥 실시간 운영 현황</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(52,211,153,0.1)', color: '#34d399', padding: '2px 8px', borderRadius: '50px', fontWeight: 'bold' }}>정상 가동</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '0.85rem' }}>
              <span>오늘의 방문 고객</span>
              <span style={{ fontWeight: 'bold' }}>+124명</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '0.85rem' }}>
              <span>1등 한우 경품 재고</span>
              <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>2 / 5개 남음</span>
            </div>
          </div>

          {/* 서브 카드 2: 실시간 당첨 로그 피드 */}
          <div style={{
            background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: '20px', padding: '1rem 1.5rem', width: '100%', maxWidth: '440px',
            display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#888',
            fontFamily: 'monospace'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#c5a059' }}>19:15:10</span>
              <span>010-****-5678 고객님 [스타벅스 커피] 당첨!</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#666' }}>19:12:45</span>
              <span>010-****-9012 고객님 [다음 기회에] 당첨</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', animation: 'pulse 2s infinite' }}>
              <span style={{ color: '#c5a059' }}>19:08:30</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>010-****-3456 고객님 [🥇 1등 한우 세트] 당첨! 🎉</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── [3] 신뢰/핵심 가치 바 (Trust Value Bar) ── */}
      <section id="features" style={{
        background: 'rgba(197, 160, 89, 0.05)',
        borderTop: '1px solid rgba(197, 160, 89, 0.15)',
        borderBottom: '1px solid rgba(197, 160, 89, 0.15)',
        padding: '2.2rem 1.5rem',
        marginTop: '3rem',
        marginBottom: '6rem'
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          flexWrap: 'wrap', gap: '30px'
        }}>
          {[
            { label: '🔒 가맹점별 독립 데이터 운영', desc: '완벽한 100% 매장 정보 격리' },
            { label: '🎁 실시간 경품 재고 자동 제어', desc: '트랜잭션 기반 오버드로우 제로' },
            { label: '📱 노필터 모바일 점주실 제공', desc: '귀찮은 앱 다운로드 필요 없음' },
            { label: '💬 스마트 문자 수수료 ZERO', desc: '중계비 없는 기본 문자 직발송' }
          ].map((val, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.3px' }}>{val.label}</span>
              <span style={{ fontSize: '0.78rem', color: '#c5a059', fontWeight: 'bold', opacity: 0.8 }}>{val.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── [4] 업종별 데모 / 활용 사례 (Vertical Case Studies) ── */}
      <section id="cases" style={{ maxWidth: '1150px', margin: '0 auto 6rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '900', marginBottom: '1.2rem', letterSpacing: '-1px' }}>
            🏪 우리 매장 업종에 맞춤형 도입 제안
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.98rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            어떤 업종이든 상관없습니다. 업종별 최적의 경품 설계 방식과 점주 전용 룰렛 기획으로 즉각적인 고객 집객 효과를 보장합니다.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {caseStudies.map((cs, idx) => (
            <div key={idx} style={{
              background: 'rgba(255,255,255,0.01)',
              border: `1px solid rgba(255, 255, 255, 0.03)`,
              borderRadius: '24px', padding: '2.2rem 1.8rem',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }} className="case-card">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: cs.themeColor, marginBottom: '0.8rem' }}>
                  {cs.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#fff', fontWeight: '800', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                  🎯 {cs.goal}
                </p>
                <p style={{ fontSize: '0.88rem', color: '#ddd', lineHeight: 1.6, marginBottom: '1.5rem', wordBreak: 'keep-all' }}>
                  {cs.desc}
                </p>
              </div>
              <div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>🎁 추천 경품 설계 예시</span>
                  <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 'bold' }}>{cs.prize}</span>
                </div>
                <button 
                  onClick={() => navigate('/event')}
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = cs.themeColor;
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.border = `1px solid ${cs.themeColor}`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  }}
                >
                  실시간 데모 확인하기 ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── [5] 운영 방식 설명 (How It Works) ── */}
      <section style={{ background: 'rgba(0,0,0,0.3)', padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.02)', marginBottom: '6rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <h2 style={{ fontSize: '2.1rem', fontWeight: '900', marginBottom: '1.2rem', letterSpacing: '-1px' }}>
              💡 매장 운영 및 연동 4단계 워크플로우
            </h2>
            <p style={{ color: '#aaa', fontSize: '0.98rem' }}>
              QR 스캔부터 리마인드 마케팅까지, 매장과 단골을 잇는 가장 단순하고 확실한 파이프라인
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 15px 1fr 15px 1fr 15px 1fr',
            alignItems: 'center', gap: '15px'
          }} className="how-it-works-grid">
            
            {/* 1단계 */}
            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>1</div>
              <h4 style={stepTitleStyle}>매장 방문 & QR 응모</h4>
              <p style={stepDescStyle}>테이블 텐트나 카운터에 부착된 QR 코드를 스마트폰으로 간편 스캔하여 이름과 연락처 입력</p>
            </div>

            {/* 화살표 */}
            <div className="step-arrow" style={{ fontSize: '1.5rem', color: '#c5a059', fontWeight: 'bold', textAlign: 'center' }}>➔</div>

            {/* 2단계 */}
            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>2</div>
              <h4 style={stepTitleStyle}>즉석 룰렛 참여</h4>
              <p style={stepDescStyle}>고객 전용 화면에 뜬 프리미엄 골드 룰렛을 즉석 회전시켜 1초 만에 흥미로운 당첨 결과 확인</p>
            </div>

            {/* 화살표 */}
            <div className="step-arrow" style={{ fontSize: '1.5rem', color: '#c5a059', fontWeight: 'bold', textAlign: 'center' }}>➔</div>

            {/* 3단계 */}
            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>3</div>
              <h4 style={stepTitleStyle}>재고 실시간 자동차감</h4>
              <p style={stepDescStyle}>당첨 결과에 맞춰 사장님이 지정한 경품 재고가 안전하게 차감되며, 실시간으로 통계에 집계</p>
            </div>

            {/* 화살표 */}
            <div className="step-arrow" style={{ fontSize: '1.5rem', color: '#c5a059', fontWeight: 'bold', textAlign: 'center' }}>➔</div>

            {/* 4단계 */}
            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>4</div>
              <h4 style={stepTitleStyle}>감사 문자 & 단골 유도</h4>
              <p style={stepDescStyle}>당첨 고객 휴대폰 번호로 이벤트 문자 및 감사 템플릿을 발송하여 완벽한 재방문 락인 완성</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── [6] 핵심 기능 섹션 (Core Feature Grid) ── */}
      <section id="functions" style={{ maxWidth: '1150px', margin: '0 auto 6rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '900', marginBottom: '1.2rem', letterSpacing: '-1px' }}>
            🛠️ 안정적인 매장 운영을 위한 6대 핵심 테크놀로지
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.98rem' }}>
            단순 룰렛 모방판이 아닌, 오프라인 매장의 실제 당첨 리스크 제어와 마케팅 극대화를 위해 설계된 고급 솔루션 사양
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px'
        }}>
          {coreFeatures.map((feat, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(197, 160, 89, 0.1)',
              borderRadius: '24px', padding: '2.2rem 2rem',
              boxShadow: '0 15px 45px rgba(0,0,0,0.3)',
              textAlign: 'left'
            }} className="feature-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{feat.icon}</div>
                <span style={{ fontSize: '0.7rem', color: '#c5a059', background: 'rgba(197,160,89,0.08)', border: '1px solid rgba(197,160,89,0.3)', padding: '3px 10px', borderRadius: '50px', fontWeight: '900' }}>{feat.badge}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.8rem' }}>
                {feat.title}
              </h3>
              <p style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: 1.6, wordBreak: 'keep-all', marginBottom: '1rem' }}>
                {feat.desc}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#c5a059', fontWeight: '900' }}>
                <span>✦ 사장님 이점: </span>
                <span style={{ color: '#fff' }}>비용 절감 및 매장 신뢰 구축</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── [7] 실제 운영 화면 / 제품 쇼케이스 ── */}
      <section style={{ background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.02)', padding: '6rem 2rem', marginBottom: '6rem' }}>
        <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.1rem', fontWeight: '900', marginBottom: '1.2rem', letterSpacing: '-1px' }}>
              📸 실제 서비스 구동 화면 미리보기
            </h2>
            <p style={{ color: '#aaa', fontSize: '0.98rem' }}>
              점주와 고객이 마주하는 실제 아름답고 직관적인 모바일 및 웹 대시보드 화면을 간접 탐색해 보세요.
            </p>
          </div>

          {/* 탭 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {[
              { id: 'customer', label: '📱 고객용 룰렛 화면', desc: 'QR 스캔 후 마주하는 초고광택 골드 룰렛' },
              { id: 'store', label: '📲 점주용 모바일 관리실', desc: '현장 서빙 중 실시간 경품 및 템플릿 제어' },
              { id: 'dashboard', label: '💻 PC 대화형 통계 센터', desc: '종합 통계 데이터 및 기간별 고객 상세 로그' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveShowcaseTab(tab.id)}
                style={{
                  background: activeShowcaseTab === tab.id ? 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)' : 'rgba(255,255,255,0.02)',
                  color: activeShowcaseTab === tab.id ? '#000' : '#fff',
                  border: activeShowcaseTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  padding: '1rem 2rem', borderRadius: '50px', fontSize: '0.92rem', fontWeight: '900',
                  cursor: 'pointer', transition: 'all 0.3s', boxShadow: activeShowcaseTab === tab.id ? '0 10px 25px rgba(248, 181, 0, 0.25)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 본문 뷰포트 */}
          <div style={{
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(197, 160, 89, 0.25)',
            borderRadius: '40px', padding: '3.5rem 2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '40px', alignItems: 'center', boxShadow: '0 25px 70px rgba(0,0,0,0.8)'
          }} className="showcase-content-grid">
            
            {/* 왼쪽: 탭 설명 설명 */}
            <div style={{ textAlign: 'left' }}>
              {activeShowcaseTab === 'customer' && (
                <div>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(197,160,89,0.1)', color: '#c5a059', padding: '5px 12px', borderRadius: '50px', fontWeight: '900' }}>고객 접점 최적화</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '1.2rem 0 1rem 0' }}>추가 회원가입이 필요 없는<br/>간편 응모 룰렛 브라우저</h3>
                  <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    고객은 별도의 회원가입 없이 휴대폰 번호 본인 인증 및 이름 기입만으로 3초 만에 룰렛 판에 진입합니다. 황홀한 사운드 햅틱 효과와 고광택 프레임 애니메이션으로 당첨 시 쾌감을 극대화하여 기분 좋은 현장 피드백을 전달합니다.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#ddd' }}>
                    <li>✔️ 100% 모바일 브라우저 구동 (Safari, Chrome 완벽 호환)</li>
                    <li>✔️ 가맹점 맞춤형 브랜드 로고 및 설명 렌더링</li>
                    <li>✔️ 당첨 확률 설정에 따른 정밀 룰렛 회전 궤적 동기화</li>
                  </ul>
                </div>
              )}
              {activeShowcaseTab === 'store' && (
                <div>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(52,211,153,0.1)', color: '#34d399', padding: '5px 12px', borderRadius: '50px', fontWeight: '900' }}>점주 운영 편리성</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '1.2rem 0 1rem 0' }}>서빙 중에도 스마트폰으로<br/>경품 재고 및 문구 실시간 관리</h3>
                  <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    사장님은 매장 안을 돌아다니시며 스마트폰으로 즉시 경품 수량이나 당첨 제한을 설정하실 수 있습니다. 긴급하게 템플릿 문구를 수정하여 발송해야 하거나 실시간 당첨된 고객 로그 정보를 확인할 때 즉시 조치가 가능합니다.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#ddd' }}>
                    <li>✔️ 간편 비밀코드(1234) 입력으로 1초 만에 점주실 로그인</li>
                    <li>✔️ 경품의 활성/비활성 여부 및 보유 수량 실시간 토글 제어</li>
                    <li>✔️ 필터링된 당첨자에게 단체 SMS 직배송 환경 매핑</li>
                  </ul>
                </div>
              )}
              {activeShowcaseTab === 'dashboard' && (
                <div>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', padding: '5px 12px', borderRadius: '50px', fontWeight: '900' }}>종합 분석 및 신뢰</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '1.2rem 0 1rem 0' }}>한눈에 파악하는 매장 통계 및<br/>신뢰성 높은 고객 응모 타임라인</h3>
                  <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    일자별, 당첨자 그룹별 종합 응모 리포트를 미려한 통계 카드로 한눈에 분석하세요. 1년(ONE_YEAR) 단위 자동 응모 로그 클린업 기능을 제공하여 오래된 무효 로그를 안전하게 정리하고 최상의 데이터 조회 속도를 유지합니다.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#ddd' }}>
                    <li>✔️ 누적 총 응모자, 당첨 처리 현황, 오늘의 실시간 응모자 통계</li>
                    <li>✔️ 간편 기간 프리셋 검색 필터 (1개월~4개월 간편 설정)</li>
                    <li>✔️ 당첨 경품별 맞춤형 컬러 배지 라벨 렌더링</li>
                  </ul>
                </div>
              )}
            </div>

            {/* 오른쪽: 가상 목업 기기 화면 렌더링 */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {activeShowcaseTab === 'customer' && (
                <div style={mockupContainerStyle}>
                  <div style={mockupHeaderStyle}>이벤트룰렛 다인점 🍽️</div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '20px' }}>
                    <p style={{ fontSize: '0.78rem', color: '#ffb53f', margin: 0, fontWeight: 'bold' }}>축하드립니다! 1등 한우 모듬 세트에 당첨되셨습니다!</p>
                    <div style={{ width: '130px', height: '130px', borderRadius: '50%', border: '4px solid #c5a059', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', boxShadow: '0 0 15px rgba(197,160,89,0.3)' }}>🏆 한우세트</div>
                    <div style={{ background: '#151515', border: '1px solid #333', borderRadius: '12px', padding: '10px 15px', width: '100%', fontSize: '0.78rem', color: '#bbb' }}>카운터의 직원에게 당첨 화면을 보여주시고 본인확인 후 즉시 지급받으세요.</div>
                  </div>
                </div>
              )}
              {activeShowcaseTab === 'store' && (
                <div style={mockupContainerStyle}>
                  <div style={mockupHeaderStyle}>사장님 점주 관리 센터 📲</div>
                  <div style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>⚙️ 경품 목록 편집</span>
                      <span style={{ color: '#ffb53f' }}>+경품 추가</span>
                    </div>
                    <div style={{ background: '#111', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span style={{ color: '#fff' }}>🥇 1등 명품 와인 세트</span>
                      <span style={{ background: '#ff4d4d', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>3개 남음</span>
                    </div>
                    <div style={{ background: '#111', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span style={{ color: '#fff' }}>☕ 2등 커피 쿠폰</span>
                      <span style={{ background: '#34d399', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>98개 남음</span>
                    </div>
                    <div style={{ background: 'rgba(197,160,89,0.1)', border: '1px solid #c5a059', borderRadius: '10px', padding: '10px', fontSize: '0.7rem', color: '#c5a059', marginTop: '10px', textAlign: 'left' }}>💡 새로운 공지 등록: "이번 주말 방문 응모 시 전원 무료 탄산음료 증정!"</div>
                  </div>
                </div>
              )}
              {activeShowcaseTab === 'dashboard' && (
                <div style={{ ...mockupContainerStyle, width: '100%', maxWidth: '420px', height: '280px' }}>
                  <div style={mockupHeaderStyle}>실시간 응모 타임라인 리포트 📊</div>
                  <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', fontSize: '0.65rem', color: '#c5a059', borderBottom: '1px solid #222', paddingBottom: '4px', fontWeight: 'bold' }}>
                      <span>시각</span>
                      <span>고객명</span>
                      <span>연락처</span>
                      <span>당첨 결과</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', fontSize: '0.65rem', color: '#fff' }}>
                      <span>19:15:10</span>
                      <span>김*희</span>
                      <span>010-****-5678</span>
                      <span style={{ color: '#fbbf24' }}>🥇 1등 한우세트</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', fontSize: '0.65rem', color: '#aaa' }}>
                      <span>19:12:45</span>
                      <span>이*수</span>
                      <span>010-****-9012</span>
                      <span style={{ color: '#666' }}>🍀 다음 기회에</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', fontSize: '0.65rem', color: '#fff' }}>
                      <span>19:08:30</span>
                      <span>박*민</span>
                      <span>010-****-3456</span>
                      <span style={{ color: '#34d399' }}>☕ 아메리카노</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ── [8] 요금제 섹션 & 상세 기능 비교표 (Pricing & Detail Table) ── */}
      <section id="pricing" style={{ maxWidth: '1050px', margin: '0 auto 6rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '900', marginBottom: '1.2rem', letterSpacing: '-1px' }}>
            💵 우리 매장에 꼭 맞는 합리적인 요금제 플랜
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.98rem' }}>
            초기 세팅비 무상 지원 및 약정 기간이 없는 투명한 월 구독 결제 시스템
          </p>
        </div>

        {/* 요금제 카드 3선 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px', alignItems: 'stretch', marginBottom: '5rem'
        }}>
          {pricing.map((plan, idx) => (
            <div key={idx} style={{
              background: plan.popular ? 'rgba(197, 160, 89, 0.08)' : 'rgba(255,255,255,0.015)',
              border: plan.popular ? '2px solid #c5a059' : '1px solid rgba(255,255,255,0.04)',
              borderRadius: '28px', padding: '2.8rem 2rem', display: 'flex',
              flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden'
            }} className="pricing-card">
              
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '15px', right: '-35px',
                  background: '#c5a059', color: '#000', fontSize: '0.62rem',
                  fontWeight: '900', padding: '6px 35px', transform: 'rotate(45deg)',
                  letterSpacing: '0.05em'
                }}>
                  RECOMMENDED
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>
                  {plan.name}
                </h3>
                <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#c5a059', marginBottom: '1.8rem' }}>
                  {plan.price}
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#ccc', textAlign: 'left' }}>
                      <span style={{ color: '#c5a059', fontWeight: 'bold' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <a 
                href="mailto:contact@dntprbs-roulette.com"
                style={{
                  width: '100%', padding: '1rem', marginTop: '2.5rem',
                  background: plan.popular ? 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)' : 'rgba(255,255,255,0.04)',
                  color: plan.popular ? '#000' : '#fff', border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '15px', fontSize: '0.92rem', fontWeight: 'bold',
                  cursor: 'pointer', transition: 'all 0.3s', textDecoration: 'none', display: 'inline-block', textAlign: 'center'
                }}
              >
                도입 및 기술 제안 신청
              </a>

            </div>
          ))}
        </div>

        {/* 상세 기능 비교표 (Comparison Table) */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#c5a059', fontWeight: '800' }}>📋 디테일 세부 비교 스펙 시트</h3>
        </div>
        <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '1.5rem' }} className="comparison-table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(197, 160, 89, 0.4)', color: '#c5a059', fontWeight: 'bold' }}>
                <th style={{ padding: '1rem 0.5rem' }}>제공 기능 스펙</th>
                <th style={{ padding: '1rem 0.5rem' }}>Starter</th>
                <th style={{ padding: '1rem 0.5rem' }}>Pro Gold (점주 추천)</th>
                <th style={{ padding: '1rem 0.5rem' }}>Enterprise (프랜차이즈)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: '가동 가능 매장 수', s: '1개 매장', p: '1개 매장', e: '무제한 (전 지점 통합관리)' },
                { name: '실시간 경품 재고 제어', s: '수동 편집 제어', p: '실시간 자동 차감 트랜잭션', e: '실시간 자동 차감 트랜잭션' },
                { name: '모바일 점주 관리실', s: '제한적 조회', p: '100% 지원 (공지/재고/문자)', e: '100% 지원 (브랜드 로고 완벽커스텀)' },
                { name: '고객 감사 문자 발송', s: '지원하지 않음', p: '기본 SMS 직전송 (수수료 0원)', e: '대량 SMS 게이트웨이 커스텀 연동' },
                { name: '이벤트 응모 로그 보존', s: '최근 7일 보존', p: '최근 1년 보존 (CLEANUP 가동)', e: '영구 보존 및 엑셀 다운로드 완벽지원' },
                { name: '전용 도메인 매핑', s: '지원하지 않음', p: '지원하지 않음', e: '100% 전용 도메인 개별 세팅 가능' },
                { name: '밀착 전담 케어 지원', s: '이메일 문의 대기', p: '24시간 카카오톡 실시간 채널', e: '지정 기술 엔지니어 밀착 전담 케어' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: '800', color: '#fff' }}>{row.name}</td>
                  <td style={{ padding: '1rem 0.5rem', color: '#aaa' }}>{row.s}</td>
                  <td style={{ padding: '1rem 0.5rem', color: '#c5a059', fontWeight: 'bold' }}>{row.p}</td>
                  <td style={{ padding: '1rem 0.5rem', color: '#fff' }}>{row.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── [9] FAQ 아코디언 섹션 ── */}
      <section id="faq" style={{ maxWidth: '800px', margin: '0 auto 6rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '900', marginBottom: '1.2rem', letterSpacing: '-1px' }}>
            🤔 도입을 생각 중이신 사장님 필수 질문 FAQ
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.98rem' }}>
            매장 이벤트 룰렛 솔루션 도입과 관련하여 요금제, 보안, 데이터 연동에 관한 핵심 지표들을 투명하게 답변해 드립니다.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqList.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: isOpen ? '1px solid #c5a059' : '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* 질문 헤더 클릭 */}
                <div
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  style={{
                    padding: '1.3rem 1.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isOpen ? 'rgba(197, 160, 89, 0.03)' : 'transparent'
                  }}
                >
                  <span style={{
                    fontSize: '0.98rem',
                    fontWeight: '800',
                    color: isOpen ? '#c5a059' : '#fff',
                    textAlign: 'left',
                    lineHeight: 1.4,
                    wordBreak: 'keep-all'
                  }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontSize: '1.2rem',
                    color: isOpen ? '#c5a059' : '#666',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.3s ease'
                  }}>
                    ▼
                  </span>
                </div>

                {/* 답변 슬라이더 */}
                <div style={{
                  maxHeight: isOpen ? '320px' : '0',
                  opacity: isOpen ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0, 1, 0, 1)'
                }}>
                  <div style={{
                    padding: '0 1.8rem 1.6rem 1.8rem',
                    color: '#aaa',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    textAlign: 'left',
                    borderTop: '1px solid rgba(255,255,255,0.03)',
                    paddingTop: '1rem',
                    wordBreak: 'keep-all'
                  }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── [10] 최종 CTA (최종 마케팅 및 전환 배너) ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 6rem auto', padding: '0 2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)',
          border: '2px solid #c5a059',
          borderRadius: '35px', padding: '4.5rem 3rem', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(197,160,89,0.1)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* 배너 배경 은은한 후광 */}
          <div style={{
            position: 'absolute', width: '300px', height: '300px',
            background: '#c5a059', filter: 'blur(150px)', opacity: 0.1,
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }} />

          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', marginBottom: '1.2rem', letterSpacing: '-1.5px', wordBreak: 'keep-all' }}>
            이벤트룰렛으로 당신의 매장에 새로운 단골을 만드세요
          </h2>
          <p style={{ color: '#aaa', fontSize: '1rem', maxWidth: '650px', margin: '0 auto 2.5rem auto', lineHeight: 1.6, wordBreak: 'keep-all' }}>
            귀찮은 모바일 가입 과정 없이 단 5분이면 점주 전용 모바일 마케팅 오피스와 황홀한 골드 룰렛을 매장에 즉시 가동하고 단골 고객을 락인할 수 있습니다.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/event')}
              style={{
                background: 'linear-gradient(135deg, #fceabb 0%, #fccd4d 50%, #f8b500 100%)',
                color: '#000', border: 'none', padding: '1.1rem 2.5rem',
                borderRadius: '50px', fontSize: '1rem', fontWeight: '900',
                cursor: 'pointer', boxShadow: '0 10px 25px rgba(248, 181, 0, 0.3)'
              }}
              className="premium-gold-button"
            >
              🎪 실시간 데모 체험하기
            </button>
            <button 
              onClick={() => navigate('/admin')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '1.1rem 2.2rem',
                borderRadius: '50px', fontSize: '1rem', fontWeight: 'bold',
                cursor: 'pointer', backdropFilter: 'blur(5px)', transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              🔑 관리자 화면 보기
            </button>
          </div>
        </div>
      </section>

      {/* ── [11] 푸터 (Footer) ── */}
      <footer style={{
        background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.03)',
        padding: '5rem 3rem 4rem 3rem', color: '#666', fontSize: '0.8rem',
        textAlign: 'left'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
            gap: '40px', marginBottom: '3.5rem'
          }} className="footer-grid">
            
            {/* 푸터 로고 및 소개 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🎡</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-1px' }}>이벤트룰렛</span>
              </div>
              <p style={{ lineHeight: 1.6, color: '#888', wordBreak: 'keep-all' }}>
                이벤트룰렛은 오프라인 가맹점의 고객 참여 마케팅을 위해 최적화된 독립 테넌트 분할 이벤트 룰렛 솔루션입니다.
              </p>
            </div>

            {/* 퀵 메뉴 링크 */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1.2rem' }}>퀵 메뉴</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><a href="#features" style={{ color: '#888', textDecoration: 'none' }}>특장점</a></li>
                <li><a href="#cases" style={{ color: '#888', textDecoration: 'none' }}>활용사례</a></li>
                <li><a href="#functions" style={{ color: '#888', textDecoration: 'none' }}>핵심기능</a></li>
                <li><a href="#pricing" style={{ color: '#888', textDecoration: 'none' }}>요금제</a></li>
              </ul>
            </div>

            {/* 법적 고지 및 문의 */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1.2rem' }}>기술 문의</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><a href="mailto:contact@dntprbs-roulette.com" style={{ color: '#888', textDecoration: 'none' }}>📩 도입 및 파트너십 메일</a></li>
                <li><span style={{ color: '#888' }}>📞 고객센터: 1544-0000 (평일 10:00-18:00)</span></li>
                <li><a href="/privacy" style={{ color: '#888', textDecoration: 'none', fontWeight: 'bold' }}>개인정보처리방침</a></li>
                <li><a href="/terms" style={{ color: '#888', textDecoration: 'none' }}>서비스이용약관</a></li>
              </ul>
            </div>

            {/* 비즈니스 고지 (가상 정보 매핑) */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1.2rem' }}>주식회사 이벤트룰렛</h4>
              <p style={{ lineHeight: 1.6, color: '#666' }}>
                대표이사: 홍길동 | 사업자등록번호: 120-00-00000<br/>
                통신판매업 신고번호: 제 2026-서울강남-0000호<br/>
                주소: 서울특별시 강남구 테헤란로 123, 10층 (역삼동)<br/>
                © {new Date().getFullYear()} 주식회사 이벤트룰렛. All rights reserved.
              </p>
            </div>

          </div>

          {/* 푸터 하단 보더 라인 */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: '#444' }}>본 플랫폼은 프레임워크와 독립된 Firestore 테넌트 보안 구조 하에 무결하게 운영되고 있습니다.</span>
            <span style={{ fontSize: '0.75rem', color: '#c5a059', fontWeight: 'bold' }}>✦ 프리미엄 B2B 서비스 마스터피스</span>
          </div>

        </div>
      </footer>

      {/* ── 인라인 글로벌 CSS 및 키프레임 애니메이션 정의 ── */}
      <style dangerouslySetInnerHTML={{__html: `
        .super-admin-btn:hover {
          background: #c5a059 !important;
          color: #000 !important;
          box-shadow: 0 0 15px rgba(197, 160, 89, 0.4);
        }
        .demo-store-card:hover, .case-card:hover {
          transform: translateY(-8px);
          background: rgba(197, 160, 89, 0.04) !important;
          border: 1px solid rgba(197, 160, 89, 0.3) !important;
          box-shadow: 0 15px 40px rgba(0,0,0,0.6);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          border: 1px solid #c5a059 !important;
          box-shadow: 0 15px 35px rgba(197, 160, 89, 0.12) !important;
        }
        .pricing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(0,0,0,0.6);
        }
        @keyframes popupZoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
            padding: 3rem 1.5rem 2rem 1.5rem !important;
            gap: 50px !important;
          }
          .hero-grid div {
            text-align: center !important;
          }
          .hero-grid div div {
            margin: 0 auto 1rem auto !important;
          }
          .hero-grid p {
            margin: 0 auto 2.5rem auto !important;
          }
          .hero-grid .premium-gold-button {
            margin: 0 auto !important;
          }
          .how-it-works-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .step-arrow {
            transform: rotate(90deg) !important;
            margin: 10px 0 !important;
          }
          .showcase-content-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            padding: 2rem 1.5rem !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .header-links {
            display: none !important;
          }
        }
      `}} />

    </div>
  );
};

// 요금제 구성 데이터는 pricing 상수로 선언되어 있으므로 유지
export default CompanyIntro;
