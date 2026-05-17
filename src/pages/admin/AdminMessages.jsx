import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { useIsMobile } from '../../hooks/useIsMobile';
import MobileAdminMessages from '../../components/admin/MobileAdminMessages';
import { useTenant } from '../../context/TenantContext';

const AdminMessages = () => {
  const { tenantId, getDocRef, getColRef } = useTenant();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [smsTemplate, setSmsTemplate] = useState('[이벤트룰렛] 고객님, 새로운 이벤트가 시작되었습니다! 지금 바로 매장으로 오셔서 이벤트에 참여해보세요!');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const q = query(getColRef('entries'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    if (window.confirm('클라우드의 모든 응모 내역을 삭제하시겠습니까?')) {
      try {
        for (const entry of entries) {
          await deleteDoc(getDocRef('entries', entry.id));
        }
        setEntries([]);
        alert('삭제 완료');
      } catch (err) {
        alert('삭제 실패');
      }
    }
  };

  const uniqueData = useMemo(() => {
    return Array.from(new Map(entries.map(item => [item.phone, item])).values());
  }, [entries]);

  // [NEW] 3단계: CSV 응모자 목록 추출 다운로드 함수
  const handleDownloadCSV = () => {
    if (entries.length === 0) {
      alert('다운로드할 응모 내역이 없습니다.');
      return;
    }

    // 한글 깨짐 방지를 위해 UTF-8 BOM 주입
    let csvContent = "\uFEFF";
    csvContent += "날짜,이름,연락처,당첨결과\n";

    entries.forEach(entry => {
      const safeDate = `"${entry.date || ''}"`;
      const safeName = `"${entry.name || ''}"`;
      const safePhone = `"${entry.phone || ''}"`;
      const safePrize = `"${entry.prize || ''}"`;
      csvContent += `${safeDate},${safeName},${safePhone},${safePrize}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `이벤트룰렛_응모자목록_${tenantId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isMobile = useIsMobile(768);

  if (loading) return <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>내역 불러오는 중...</div>;

  if (isMobile) {
    return (
      <div className="admin-content-inner">
        <MobileAdminMessages 
          entries={entries}
          uniqueData={uniqueData}
          smsTemplate={smsTemplate}
          setSmsTemplate={setSmsTemplate}
          clearAll={clearAll}
          handleDownloadCSV={handleDownloadCSV}
        />
      </div>
    );
  }

  return (
    <div className="glass" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>📋 고객 응모 내역 (Cloud)</h3>
        {/* [차후 구현을 위해 보관]
        <button 
          onClick={handleDownloadCSV}
          className="premium-gold-button"
          style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', fontSize: '0.85rem' }}
        >
          📥 CSV 내역 다운로드
        </button>
        */}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>메세지 템플릿 수정</label>
        <textarea value={smsTemplate} onChange={(e) => setSmsTemplate(e.target.value)} style={{ width: '100%', height: '80px', background: '#000', border: '1px solid #333', padding: '1rem', color: '#fff', borderRadius: '12px' }} />
        <button 
          onClick={() => {
            const numbers = uniqueData.map(e => e.phone.replace(/[^0-9]/g, '')).join(',');
            window.location.href = `sms:${numbers}?body=${encodeURIComponent(smsTemplate)}`;
          }} 
          className="premium-gold-button"
          style={{ padding: '1.2rem', borderRadius: '15px' }}
        >
          💬 이벤트 참여 고객 문자 발송 ({uniqueData.length}명)
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>날짜</th>
              <th style={{ padding: '1rem' }}>이름</th>
              <th style={{ padding: '1rem' }}>연락처</th>
              <th style={{ padding: '1rem' }}>당첨결과</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem' }}>{entry.date}</td>
                <td style={{ padding: '1rem' }}>{entry.name}</td>
                <td style={{ padding: '1rem' }}>{entry.phone}</td>
                <td style={{ padding: '1rem', color: 'var(--primary)' }}>{entry.prize}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMessages;
