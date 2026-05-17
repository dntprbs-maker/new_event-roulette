import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBdVUrgAeSCbzBVCQVk0wnLRcKcywxp5bY",
  authDomain: "dineevent.firebaseapp.com",
  projectId: "dineevent",
  storageBucket: "dineevent.firebasestorage.app",
  messagingSenderId: "775751591653",
  appId: "1:775751591653:web:88a846761a8f8bba4e160c",
  measurementId: "G-EHH6XHWV7Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const storeTemplates = [
  { id: 'ediya-mock', name: '이디야커피 모의점 ☕', address: '서울 강남구 테헤란로 12길' },
  { id: 'starbucks-mock', name: '스타벅스 모의점 🍵', address: '서울 서초구 서초대로 34길' },
  { id: 'bbq-mock', name: 'BBQ치킨 모의점 🍗', address: '서울 송파구 올림픽로 56길' },
  { id: 'twosome-mock', name: '투썸플레이스 모의점 🍰', address: '서울 마포구 양화로 78길' },
  { id: 'hollys-mock', name: '할리스 모의점 🥐', address: '서울 용산구 한강대로 90길' },
  { id: 'mega-mock', name: '메가커피 모의점 🍹', address: '서울 영등포구 여의대로 12길' },
  { id: 'compose-mock', name: '컴포즈커피 모의점 🥤', address: '서울 종로구 대학로 34길' },
  { id: 'paik-mock', name: '빽다방 모의점 🍧', address: '서울 중구 세종대로 56길' },
  { id: 'gongcha-mock', name: '공차 모의점 🧋', address: '서울 성동구 왕십리로 78길' },
  { id: 'baskin-mock', name: '배스킨라빈스 모의점 🍦', address: '서울 광진구 능동로 90길' }
];

const customerNames = ['김민수', '이서연', '박준우', '최아름', '정도윤', '강지혜', '조예준', '윤다은', '장현우', '한지민', '오지훈', '신예은', '배건우', '유진아', '임성민'];
const prizePool = [
  '1등 샴페인 교환권 🍾',
  '2등 시그니처 머그 ☕',
  '3등 수제 케이크 🍰',
  '4등 아메리카노 1잔 ☕',
  '5등 프리미엄 초콜릿 🍫',
  '다음 기회에 (꽝) 🎡',
  '다음 기회에 (꽝) 🎡',
  '다음 기회에 (꽝) 🎡' // 꽝 확률을 높이기 위해
];

const seed = async () => {
  console.log('🚀 [이벤트룰렛] 10개 매장 및 매장별 50개(총 500개) 목업 데이터 생성을 개시합니다...');

  for (let s = 0; s < storeTemplates.length; s++) {
    const store = storeTemplates[s];
    console.log(`\n📦 [${s + 1}/10] 매장 개설 중: ${store.name} (${store.id})`);

    // 1. 마스터 테넌트 가맹점 생성
    const tenantRef = doc(db, 'tenants', store.id);
    await setDoc(tenantRef, {
      brandName: store.name,
      address: store.address,
      adminPasscode: '1234', // 사장님 비밀코드
      status: 'active',
      createdAt: new Date()
    });

    // 2. 가맹점 기본 홈 설정 데이터 세팅
    await setDoc(doc(db, `tenants/${store.id}/settings`, 'home'), {
      brandName: store.name,
      topLabel: 'GRAND OPEN & LUCKY DRAW',
      title: '행운을 잡으세요!',
      subtitle: '터치 한 번으로 100% 모바일 룰렛 경품 이벤트에 즉시 응모하세요.',
      heroImage: ''
    });

    // 3. 50개 응모 고객 로그 생성
    console.log(`📝 [${store.id}] 에 50개 목업 응모 로그 주입 중...`);
    for (let e = 1; e <= 50; e++) {
      const entryId = `mock-entry-${e}`;
      
      // 이름, 폰번호, 경품 무작위 배정
      const name = customerNames[Math.floor(Math.random() * customerNames.length)];
      const randomPhoneSuffix = String(Math.floor(1000 + Math.random() * 9000));
      const phone = `010-5555-${randomPhoneSuffix}`;
      const prize = prizePool[Math.floor(Math.random() * prizePool.length)];

      // 날짜 계산 (최근 2일간 순차적으로 발생한 것처럼 목업 생성)
      const mockTime = new Date();
      mockTime.setMinutes(mockTime.getMinutes() - (e * 30)); // 30분 단위 차감

      const entryRef = doc(db, `tenants/${store.id}/entries`, entryId);
      await setDoc(entryRef, {
        name: name,
        phone: phone,
        prize: prize,
        prizeName: prize,
        date: mockTime.toLocaleString('ko-KR'),
        timestamp: mockTime,
        createdAt: mockTime
      });
    }
    console.log(`✅ [${store.id}] 목업 적재 완료.`);
  }

  console.log('\n🎉 [완료] 10개 매장 및 총 500개 고객 당첨 로그 데이터베이스 이식이 완벽히 종료되었습니다!');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ 시딩 중 오류 발생:', err);
  process.exit(1);
});
