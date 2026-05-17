import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { getDocs, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useTenant } from '../../context/TenantContext';

const AdminNoticeManager = () => {
  const { tenantId, getDocRef, getColRef } = useTenant();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null); // [NEW] 삭제 확인 대상 ID 추가
  const [editForm, setEditForm] = useState({ content: '', startDate: '', endDate: '', isPinned: false });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const q = query(getColRef('notices'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotices(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id); // 팝업 띄우기
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(getDocRef('notices', deleteTargetId));
      setDeleteTargetId(null);
      await fetchNotices();
      alert('삭제되었습니다.');
    } catch (err) {
      console.error("Delete error:", err);
      alert('삭제 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const startEdit = (notice) => {
    setEditingId(notice.id);
    setEditForm({
      content: notice.content,
      startDate: notice.startDate,
      endDate: notice.endDate,
      isPinned: notice.isPinned || false
    });
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(getDocRef('notices', editingId), editForm);
      setEditingId(null);
      fetchNotices();
      alert('수정되었습니다.');
    } catch (err) {
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '15px',
    padding: '1.5rem',
    marginBottom: '1rem',
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    background: '#111',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: '8px',
    marginBottom: '1rem'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <h2 style={{ color: '#c5a059', marginBottom: '2rem', textAlign: 'center', fontWeight: '900' }}>
        📋 공지 사항 관리
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>데이터 로딩 중...</div>
      ) : notices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>등록된 공지사항이 없습니다.</div>
      ) : (
        <div>
          {notices.map(notice => (
            <div key={notice.id} style={cardStyle}>
              {editingId === notice.id ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c5a059' }}>시작일</label>
                      <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({...editForm, startDate: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c5a059' }}>종료일</label>
                      <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({...editForm, endDate: e.target.value})} style={inputStyle} />
                    </div>
                  </div>

                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c5a059' }}>공지 내용</label>
                  <textarea 
                    value={editForm.content}
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleUpdate} style={{ flex: 1, padding: '0.8rem', background: '#c5a059', color: '#00', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>저장</button>
                    <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ color: '#c5a059', fontSize: '0.9rem' }}>{notice.startDate} ~ {notice.endDate}</span>
                    {notice.isPinned && <span style={{ background: '#c5a059', color: '#000', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>고정됨</span>}
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '1.5rem' }}>{notice.content}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => startEdit(notice)} style={{ flex: 1, padding: '0.6rem', background: 'rgba(197, 160, 89, 0.1)', color: '#c5a059', border: '1px solid #c5a059', borderRadius: '8px', cursor: 'pointer' }}>수정</button>
                    <button onClick={() => handleDeleteClick(notice.id)} style={{ flex: 1, padding: '0.6rem', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '8px', cursor: 'pointer' }}>삭제</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── [NEW] 삭제 확인 모달 ── */}
      {deleteTargetId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div style={{
            background: '#1a1a1a', border: '1px solid rgba(197, 160, 89, 0.3)',
            padding: '2rem', borderRadius: '20px', textAlign: 'center', width: '320px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗑️</div>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '900' }}>공지 삭제</h4>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>이 공지사항을 삭제할까요?<br/>복구할 수 없습니다.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteTargetId(null)} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: '#333', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: 'linear-gradient(135deg, #ff4d4d, #cc0000)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticeManager;
