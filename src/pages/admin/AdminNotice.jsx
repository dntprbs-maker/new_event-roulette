import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // [NEW] 이동 기능 임포트
import { db } from '../../firebase';
import { addDoc, getDocs, deleteDoc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useTenant } from '../../context/TenantContext';

const AdminNotice = ({ onClose, compact = false }) => {
  const { tenantId, getDocRef, getColRef } = useTenant();
  const navigate = useNavigate(); // [NEW] 이동 함수 선언
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null); // 삭제 확인 대상 ID

  // 템플릿 관련 상태
  const [templates, setTemplates] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false); // 템플릿 패널 표시 여부

  const getLocalDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getToday = () => getLocalDateStr(new Date());
  const getNextWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return getLocalDateStr(d);
  };

  // 폼 상태
  const [form, setForm] = useState({
    id: null,
    startDate: getToday(),
    endDate: getNextWeek(),
    content: '',
    isPinned: false
  });

  useEffect(() => {
    fetchNotices();
    fetchTemplates(); // 템플릿도 함께 불러오기
  }, []);

  const fetchNotices = async () => {
    try {
      // [FIX] 복합 인덱스 불필요 - createdAt 단일 정렬 후 JS에서 isPinned 처리
      const q = query(getColRef('notices'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // 고정(isPinned) 항목을 먼저, 그 다음 최신순 정렬
      const sorted = list.sort((a, b) => {
        if (b.isPinned !== a.isPinned) return b.isPinned ? 1 : -1;
        return 0; // createdAt은 이미 Firestore에서 내림차순 처리
      });
      
      setNotices(sorted);
    } catch (err) {
      console.error("Notice fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log("Saving notice...", form);
    if (!form.content.trim()) {
      alert('공지 내용을 입력해주세요.');
      return;
    }
    
    // [NEW] 날짜 유효성 검사
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    
    if (start > end) {
      console.error("Validation failed: End date is before start date.");
      alert('⚠️ 종료일은 시작일보다 빠를 수 없습니다.\n공지기간을 다시 확인해 주세요.');
      return;
    }

    setSaving(true);
    try {
      if (form.id) {
        // 수정
        const docRef = getDocRef('notices', form.id);
        await updateDoc(docRef, {
          startDate: form.startDate,
          endDate: form.endDate,
          content: form.content,
          isPinned: form.isPinned,
          updatedAt: serverTimestamp()
        });
      } else {
        // 신규 등록
        await addDoc(getColRef('notices'), {
          startDate: form.startDate,
          endDate: form.endDate,
          content: form.content,
          isPinned: form.isPinned,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      alert(form.id ? '수정되었습니다.' : '등록되었습니다.');
      resetForm();
      fetchNotices();
    } catch (err) {
      alert('저장 실패: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── 템플릿 관련 함수 ──

  // Firestore noticeTemplates 콜렉션에서 템플릿 목록 읽기
  const fetchTemplates = async () => {
    setTemplateLoading(true);
    try {
      const q = query(getColRef('noticeTemplates'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Template fetch error:', err);
    } finally {
      setTemplateLoading(false);
    }
  };

  // 현재 입력된 내용을 템플릿으로 저장
  const saveTemplate = async () => {
    if (!form.content.trim()) {
      alert('저장할 공지 내용을 먼저 입력해주세요.');
      return;
    }
    setSavingTemplate(true);
    try {
      await addDoc(getColRef('noticeTemplates'), {
        content: form.content.trim(),
        createdAt: serverTimestamp()
      });
      await fetchTemplates();
      setShowTemplates(true); // 저장 후 템플릿 패널 열기
      alert('템플릿으로 저장되었습니다!');
    } catch (err) {
      alert('템플릿 저장 실패: ' + err.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  // 템플릿 선택 시 공지내용 입력란에 채우기
  const loadTemplate = (templateContent) => {
    setForm(prev => ({ ...prev, content: templateContent }));
    setShowTemplates(false); // 불러온 후 패널 닫기
  };

  // 템플릿 삭제 확인
  const confirmDeleteTemplate = async () => {
    if (!deleteTemplateId) return;
    try {
      await deleteDoc(getDocRef('noticeTemplates', deleteTemplateId));
      setDeleteTemplateId(null);
      await fetchTemplates();
    } catch (err) {
      alert('삭제 실패: ' + err.message);
      setDeleteTemplateId(null);
    }
  };

  // 삭제 버튼 클릭 → 커스텀 확인 다이얼로그 표시
  const handleDelete = (id) => {
    setDeleteTargetId(id); // window.confirm 대신 커스텀 UI 사용
  };

  // 확인 다이얼로그에서 '삭제' 클릭 → 실제 Firestore 삭제 실행
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(getDocRef('notices', deleteTargetId));
      setDeleteTargetId(null);
      fetchNotices(); // 목록 새로고침
    } catch (err) {
      alert('삭제 실패: ' + err.message);
      setDeleteTargetId(null);
    }
  };

  const handleEdit = (notice) => {
    setForm({
      id: notice.id,
      startDate: notice.startDate,
      endDate: notice.endDate,
      content: notice.content,
      isPinned: notice.isPinned
    });
    // 팝업 내부 스크롤이므로 window.scrollTo 대신 요소 기준 scrollIntoView 사용
    setTimeout(() => {
      const formTop = document.getElementById('notice-form-top');
      if (formTop) {
        formTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const resetForm = () => {
    setForm({
      id: null,
      startDate: getToday(),
      endDate: getNextWeek(),
      content: '',
      isPinned: false
    });
  };

  // compact 모드(모바일 팝업)용 축소 스타일 세트
  const cs = compact ? {
    cardPadding: '0.8rem',
    titleSize: '0.95rem',
    titleMargin: '0.8rem',
    labelSize: '0.65rem',
    labelMargin: '0.3rem',
    gap: '0.6rem',
    textareaMinH: '60px',
    checkboxSize: '14px',
    checkboxLabel: '0.65rem',
    btnPad: '0.6rem',
    btnFont: '0.75rem',
    btnRadius: '8px',
  } : {
    cardPadding: '1.5rem 1.8rem',
    titleSize: '1.3rem',
    titleMargin: '1.5rem',
    labelSize: '0.85rem',
    labelMargin: '0.6rem',
    gap: '1.2rem',
    textareaMinH: '100px',
    checkboxSize: '18px',
    checkboxLabel: '0.9rem',
    btnPad: '1rem',
    btnFont: '1rem',
    btnRadius: '12px',
  };

  return (
    <div className="admin-notice-container" style={{ position: 'relative', minHeight: '100%' }}>

      {/* ── 커스텀 삭제 확인 다이얼로그 ── */}
      {deleteTargetId && (
        <div
          onClick={() => setDeleteTargetId(null)} // 바깥 클릭 시 취소
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            zIndex: 9999999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#141414', borderRadius: '20px',
              border: '1px solid rgba(255, 77, 77, 0.4)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              padding: '2rem', textAlign: 'center',
              width: '100%', maxWidth: '320px',
              animation: 'popupFadeIn 0.2s ease-out'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🗑️</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '900', marginBottom: '0.5rem' }}>
              공지사항 삭제
            </h4>
            <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              이 공지사항을 삭제하시겠습니까?<br />
              <span style={{ color: '#ff6b6b', fontSize: '0.75rem' }}>삭제 후 복구가 불가능합니다.</span>
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* 취소 */}
              <button
                onClick={() => setDeleteTargetId(null)}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: '10px',
                  background: '#222', border: '1px solid #333',
                  color: '#aaa', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                취소
              </button>
              {/* 삭제 확정 */}
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ff4d4d, #cc0000)',
                  border: '1px solid #ff6b6b',
                  color: '#fff', fontWeight: '900', cursor: 'pointer', fontSize: '0.9rem',
                  boxShadow: '0 0 15px rgba(255,77,77,0.3)'
                }}
              >
                삭제
              </button>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes popupFadeIn {
              from { opacity: 0; transform: scale(0.92) translateY(10px); }
              to   { opacity: 1; transform: scale(1)    translateY(0); }
            }
          `}} />
        </div>
      )}

      {/* ── 템플릿 삭제 확인 다이얼로그 ── */}
      {deleteTemplateId && (
        <div
          onClick={() => setDeleteTemplateId(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#141414', borderRadius: '20px',
              border: '1px solid rgba(255, 77, 77, 0.4)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              padding: '2rem', textAlign: 'center',
              width: '100%', maxWidth: '300px',
              animation: 'popupFadeIn 0.2s ease-out'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🗑️</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '900', marginBottom: '0.4rem' }}>
              템플릿 삭제
            </h4>
            <p style={{ color: '#aaa', fontSize: '0.82rem', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              이 템플릿을 삭제하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteTemplateId(null)}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: '#222', border: '1px solid #333', color: '#aaa', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                취소
              </button>
              <button
                onClick={confirmDeleteTemplate}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'linear-gradient(135deg, #ff4d4d, #cc0000)', border: '1px solid #ff6b6b', color: '#fff', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
      <div id="notice-form-top" className="glass admin-card-glass" style={{ 
        marginBottom: '1rem', 
        border: '1px solid rgba(197, 160, 89, 0.3)', 
        boxShadow: '0 0 30px rgba(0,0,0,0.5)',
        padding: cs.cardPadding
      }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: cs.titleMargin, textAlign: 'center', fontSize: cs.titleSize, fontWeight: '900', letterSpacing: '-1px' }}>
          ✨ 공지사항
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: cs.gap }}>
          {/* 공지기간 */}
          <div className="input-field-group">
            <label style={{ display: 'block', color: 'var(--primary)', fontWeight: 'bold', marginBottom: cs.labelMargin, fontSize: cs.labelSize }}>📅 공지기간</label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* compact: 두 줄 날짜 표시 (년도 / 월-일) */}
              {compact ? (
                <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  {/* 클릭 시 숨겨진 date input의 picker 실행 */}
                  <div
                    onClick={() => { const el = document.getElementById('compact-start-date'); el && el.showPicker && el.showPicker(); }}
                    style={{ background: '#111', border: '1px solid #444', borderRadius: '6px', padding: '0.3rem 0.4rem', cursor: 'pointer', textAlign: 'center', userSelect: 'none' }}
                  >
                    <div style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '900', lineHeight: 1.2 }}>
                      {form.startDate.slice(0, 4)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#fff', fontWeight: '600', lineHeight: 1.2 }}>
                      {form.startDate.slice(5).replace('-', '/')}
                    </div>
                  </div>
                  <input id="compact-start-date" type="date" value={form.startDate}
                    onChange={(e) => setForm({...form, startDate: e.target.value})}
                    style={{ position: 'absolute', opacity: 0, top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', pointerEvents: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="date" value={form.startDate}
                    onChange={(e) => setForm({...form, startDate: e.target.value})}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    style={inputStyle}
                  />
                </div>
              )}
              <span style={{ color: '#fff', flexShrink: 0 }}>~</span>
              {/* compact: 두 줄 날짜 표시 (년도 / 월-일) */}
              {compact ? (
                <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  <div
                    onClick={() => { const el = document.getElementById('compact-end-date'); el && el.showPicker && el.showPicker(); }}
                    style={{ background: '#111', border: '1px solid #444', borderRadius: '6px', padding: '0.3rem 0.4rem', cursor: 'pointer', textAlign: 'center', userSelect: 'none' }}
                  >
                    <div style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '900', lineHeight: 1.2 }}>
                      {form.endDate.slice(0, 4)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#fff', fontWeight: '600', lineHeight: 1.2 }}>
                      {form.endDate.slice(5).replace('-', '/')}
                    </div>
                  </div>
                  <input id="compact-end-date" type="date" value={form.endDate}
                    onChange={(e) => setForm({...form, endDate: e.target.value})}
                    style={{ position: 'absolute', opacity: 0, top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', pointerEvents: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="date" value={form.endDate}
                    onChange={(e) => setForm({...form, endDate: e.target.value})}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 공지내용 */}
          <div className="input-field-group">
            <label className="mobile-compact-label" style={{ display: 'block', color: 'var(--primary)', fontWeight: 'bold', marginBottom: cs.labelMargin, fontSize: cs.labelSize }}>📝 공지내용</label>
            <textarea 
              placeholder="공지 내용 입력"
              value={form.content}
              onChange={(e) => setForm({...form, content: e.target.value})}
              className="mobile-compact-textarea"
              style={{ ...(compact ? compactInputStyle : inputStyle), minHeight: cs.textareaMinH, resize: 'vertical' }}
            />
            {/* 템플릿 버튼 행 */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {/* 현재 내용을 템플릿으로 저장 */}
              <button
                onClick={saveTemplate}
                disabled={savingTemplate}
                style={{
                  flex: 1, padding: '0.4rem 0.6rem',
                  background: 'rgba(197,160,89,0.12)', border: '1px solid rgba(197,160,89,0.4)',
                  color: 'var(--primary)', borderRadius: '8px', fontSize: compact ? '0.6rem' : '0.78rem',
                  fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {savingTemplate ? '저장 중...' : '📌 템플릿 저장'}
              </button>
              {/* 저장된 템플릿 불러오기 토글 */}
              <button
                onClick={() => setShowTemplates(v => !v)}
                style={{
                  flex: 1, padding: '0.4rem 0.6rem',
                  background: showTemplates ? 'rgba(197,160,89,0.25)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(197,160,89,0.4)',
                  color: '#fff', borderRadius: '8px', fontSize: compact ? '0.6rem' : '0.78rem',
                  fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                📂 {showTemplates ? '목록 닫기' : '템플릿 목록'}
              </button>
            </div>

            {/* 템플릿 목록 패널 */}
            {showTemplates && (
              <div style={{
                marginTop: '8px', border: '1px solid rgba(197,160,89,0.25)',
                borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                padding: '10px', maxHeight: '220px', overflowY: 'auto'
              }}>
                <p style={{ color: 'var(--primary)', fontSize: compact ? '0.6rem' : '0.75rem', fontWeight: '800', marginBottom: '8px' }}>📋 저장된 템플릿 — 클릭하면 내용이 채워집니다</p>
                {templateLoading ? (
                  <p style={{ color: '#666', fontSize: '0.75rem', textAlign: 'center' }}>불러오는 중...</p>
                ) : templates.length === 0 ? (
                  <p style={{ color: '#555', fontSize: '0.75rem', textAlign: 'center', padding: '1rem 0' }}>저장된 템플릿이 없습니다.<br/>위의 '📌 템플릿 저장' 버튼으로 추가하세요.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {templates.map(t => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.07)', padding: '8px 10px',
                        }}
                      >
                        {/* 내용 클릭 → 불러오기 */}
                        <p
                          onClick={() => loadTemplate(t.content)}
                          style={{
                            flex: 1, color: '#ddd', fontSize: compact ? '0.6rem' : '0.8rem',
                            lineHeight: 1.4, cursor: 'pointer', margin: 0,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                          }}
                          title="클릭하면 공지내용에 불러옵니다"
                        >
                          {t.content}
                        </p>
                        {/* 템플릿 삭제 버튼 */}
                        <button
                          onClick={() => setDeleteTemplateId(t.id)}
                          style={{
                            flexShrink: 0, background: 'rgba(255,77,77,0.15)',
                            border: '1px solid rgba(255,77,77,0.3)', color: '#ff6b6b',
                            borderRadius: '6px', padding: '3px 8px',
                            fontSize: compact ? '0.55rem' : '0.7rem', cursor: 'pointer', fontWeight: '700'
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 상단 고정 (사용자 요청으로 UI 숨김) */}
          <label style={{ display: 'none', alignItems: 'center', gap: '6px', color: '#fff', cursor: 'pointer', alignSelf: 'flex-start' }}>
            <input 
              type="checkbox" 
              checked={form.isPinned} 
              onChange={(e) => setForm({...form, isPinned: e.target.checked})}
              style={{ width: cs.checkboxSize, height: cs.checkboxSize, flexShrink: 0 }}
            />
            <span style={{ fontSize: cs.checkboxLabel, fontWeight: 'bold' }}>📌 상단 고정</span>
          </label>

          {/* 버튼 그룹 */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '0.3rem' }}>
            {form.id && (
              <button 
                onClick={resetForm}
                style={{ flex: 1, background: '#333', color: '#fff', border: 'none', padding: cs.btnPad, borderRadius: cs.btnRadius, fontWeight: 'bold', cursor: 'pointer', fontSize: cs.btnFont }}
              >
                취소
              </button>
            )}
            {/* 등록 버튼은 아래에서 플로팅으로 렌더링됨 */}
          </div>
        </div>
      </div>

      {/* ── 하단 플로팅 버튼 그룹 (공지관리 + 등록하기) ── */}
      <div style={{
        position: 'fixed',
        bottom: compact ? '80px' : '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}>
        {/* 공지관리 버튼 (이동 기능 추가) */}
        <button
          className="premium-gold-button"
          onClick={() => navigate(`/${tenantId}/admin/notice-manager`)}
          style={{
            width: '140px',
            height: '48px',
            borderRadius: '24px',
            fontSize: '0.95rem',
            fontWeight: '900',
            cursor: 'pointer', // 커서 포인터로 변경
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            border: '1px solid rgba(197, 160, 89, 0.4)',
          }}
        >
          📋 공지관리
        </button>

        {/* 등록하기 버튼 */}
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="premium-gold-button"
          style={{ 
            width: '140px', 
            height: '48px', 
            borderRadius: '24px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem',
            fontWeight: '900',
            boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
            border: '1px solid rgba(197, 160, 89, 0.4)',
            cursor: 'pointer',
          }}
        >
          {saving ? '⏳ 저장 중' : '✨ 등록하기'}
        </button>
      </div>

      {/* 2. 관리 리스트 (사용자 요청으로 UI 숨김) */}
      <div style={{ display: 'none', maxWidth: '800px', margin: '0 auto' }}>
        <h4 style={{ color: '#fff', marginBottom: '1rem', fontWeight: '800', fontSize: '1.1rem' }}>📋 지난 공지 목록</h4>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>데이터 로딩 중...</div>
        ) : notices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>등록된 공지사항이 없습니다.</div>
        ) : (
          <div className="notice-grid">
            {notices.map((notice) => (
              <div key={notice.id} className="notice-card glass" style={{ border: notice.isPinned ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)' }}>
                {notice.isPinned && <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', color: '#000', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>고정됨</div>}
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                  {notice.startDate} ~ {notice.endDate}
                </div>
                <p style={{ color: '#fff', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem', whiteSpace: 'pre-wrap', minHeight: '60px' }}>
                  {notice.content}
                </p>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem' }}>
                  <button onClick={() => handleEdit(notice)} style={actionBtnStyle('#1a1a1a', 'var(--primary)')}>수정</button>
                  <button onClick={() => handleDelete(notice.id)} style={actionBtnStyle('#221111', '#ff4d4d')}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        ${datePickerOverrideStyle}
        .notice-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .notice-card {
          padding: 1.2rem;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 900px) {
          .notice-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .notice-grid { grid-template-columns: 1fr; }
          .admin-card-glass { 
            padding: 1.5rem !important; 
            border-radius: 20px !important;
          }
          .mobile-compact-label { font-size: 0.8rem !important; }
          .mobile-compact-textarea { min-height: 80px !important; padding: 0.8rem !important; font-size: 0.9rem !important; }
          .input-field-group { gap: 0.5rem !important; }
          input[type="date"] { padding: 0.8rem !important; font-size: 0.85rem !important; }
        }
      `}} />
    </div>
  );
};

const inputStyle = {
  width: '100%',
  background: '#111',
  border: '1px solid #333',
  color: '#fff',
  padding: '0.9rem',
  borderRadius: '10px',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'all 0.3s ease',
  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)'
};

// compact 모드(모바일 소형 팝업)용 - 글씨와 패딩을 줄여 넘침 방지
const compactInputStyle = {
  width: '100%',
  background: '#111',
  border: '1px solid #333',
  color: '#fff',
  padding: '0.4rem 0.5rem',  // 패딩 대폭 축소
  borderRadius: '6px',
  fontSize: '0.65rem',        // 글씨 크기 축소
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'all 0.3s ease',
  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)',
  minWidth: 0                 // flex 자식 넘침 방지
};

const actionBtnStyle = (bg, color) => ({
  flex: 1,
  background: bg,
  color: color,
  border: `1px solid ${color}33`,
  padding: '6px',
  borderRadius: '8px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  cursor: 'pointer'
});

const datePickerOverrideStyle = `
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1) sepia(100%) saturate(500%) hue-rotate(10deg);
    cursor: pointer;
    background-size: 1rem;
    padding: 0.4rem;
  }
  input[type="date"] {
    position: relative;
    color-scheme: dark;
  }
`;

export default AdminNotice;
