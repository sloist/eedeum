import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Icons } from "../components/Icons";
import { LoadingBar } from "../components/LoadingBar";
import { Toast } from "../components/Toast";
import { useAuth } from "../lib/AuthContext";
import { fetchLineDetail, fetchSameQuoteLines, toggleSave, addEcho, deleteEcho, deleteUnderline, pinEcho, addReply, fetchPrivateMemosForLine, addPrivateMemo, deletePrivateMemo, reportContent, setLinePrivate, blockUser, blockBook, blockUnderline } from "../lib/api";
import { ShareModal } from "../components/ShareModal";
import { useModal } from "../lib/ModalContext";
import { trackEvent } from "../lib/tracking";
import { EchoList, type Echo } from "../components/EchoList";
import { EchoInput, ReplyInput } from "../components/EchoInput";
import { LineActions } from "../components/LineActions";
import { OtherLines } from "../components/OtherLines";
import { AddToNoteSheet } from "../components/AddToNoteSheet";

export function UnderlinePage() {
  const { handle, id } = useParams<{ handle: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const hasBackground = !!(location.state as any)?.backgroundLocation;
  const { user } = useAuth();
  const { requireAuth } = useModal();
  const goBack = () => hasBackground ? navigate(-1) : navigate("/");
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg); setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  const [data, setData] = useState<Awaited<ReturnType<typeof fetchLineDetail>>>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [sameQuoteLines, setSameQuoteLines] = useState<{ id: string; shortId: string; userId: string; userName: string; userHandle: string; feeling: string | null }[]>([]);
  const [showSameQuote, setShowSameQuote] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "echo" | "line"; echoId?: string; echoIndex?: number; isReply?: boolean; parentIndex?: number } | null>(null);
  const [replyTo, setReplyTo] = useState<{ echoId: string; echoIndex: number; userName: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showAddToNote, setShowAddToNote] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    async function load() {
      const result = await fetchLineDetail(id!);
      if (!mounted) return;
      setData(result);
      if (result) {
        // handle 변경 대응: URL의 handle이 실제 작성자와 다르면 올바른 URL로 리다이렉트
        if (handle && result.userHandle && handle !== result.userHandle) {
          navigate(`/@${result.userHandle}/lines/${result.shortId}`, { replace: true, state: location.state });
          return;
        }
        setIsPrivate(result.isPrivate ?? false);
        const realId = result.id; // UUID — 모든 연관 조회에 사용
        // 상세 진입 추적
        if (user) {
          trackEvent(user.id, {
            eventType: "underline_detail_view", targetType: "underline", targetId: realId,
            source: "detail", metadata: { book_id: result.bookId },
          });
        }
        const privateMemos = user ? await fetchPrivateMemosForLine(user.id, realId) : [];
        const privateEchoes = privateMemos.map((m: any) => ({
          id: m.id, userId: user!.id, userName: "나", text: m.text, isSameLine: false, isPrivate: true,
        }));
        // Group replies under parents
        const allEchoes: Echo[] = [...result.echoes.map((e: any) => ({ ...e })), ...privateEchoes];
        const parentMap = new Map<string, Echo[]>();
        const topLevel: Echo[] = [];
        for (const e of allEchoes) {
          if (e.parentId) {
            if (!parentMap.has(e.parentId)) parentMap.set(e.parentId, []);
            parentMap.get(e.parentId)!.push(e);
          } else {
            topLevel.push(e);
          }
        }
        for (const e of topLevel) {
          e.replies = parentMap.get(e.id) || [];
        }
        // Sort: pinned first
        topLevel.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        setEchoes(topLevel);
        // Fetch "같은 한줄, 다른 시선" — UUID로 제외
        const sameLines = await fetchSameQuoteLines(result.quote, realId);
        if (mounted) setSameQuoteLines(sameLines);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [id, user]);

  if (loading) return <><button className="backbtn" onClick={goBack}><Icons.Back /> 뒤로</button><LoadingBar /></>;
  if (!data) return <><button className="backbtn" onClick={goBack}><Icons.Back /> 뒤로</button><div className="empty-inline">기록을 찾을 수 없습니다</div></>;

  const isPostAuthor = user?.id === data.userId;

  const handleSave = async () => {
    if (!user) { requireAuth(); return; }
    const result = await toggleSave(user.id, data.id);
    if (result === null) return;
    setSaved(result);
    if (result) {
      trackEvent(user.id, {
        eventType: "underline_save", targetType: "underline", targetId: data.id,
        source: "detail", metadata: { book_id: data.bookId },
      });
    }
  };

  const handleAddEcho = async (text: string, isPrivate: boolean) => {
    if (!user) { requireAuth(); return; }
    if (!text.trim()) return;
    if (isPrivate) {
      const result = await addPrivateMemo(user.id, data.id, text.trim());
      if (result) {
        setEchoes(prev => [...prev, { id: result.id, userId: user.id, userName: "나", text: text.trim(), isSameLine: false, isPrivate: true, replies: [] }]);
        toast("나만 볼 수 있는 메모를 남겼습니다");
      } else {
        toast("메모 저장에 실패했습니다");
      }
      return;
    }
    const result = await addEcho(data.id, user.id, text.trim(), false);
    if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
      toast(result.error);
    } else if (result) {
      setEchoes(prev => [...prev, { id: crypto.randomUUID(), userId: user.id, userName: "나", text: text.trim(), isSameLine: false, replies: [] }]);
      trackEvent(user.id, {
        eventType: "underline_echo_create", targetType: "underline", targetId: data.id,
        source: "detail", metadata: { book_id: data.bookId },
      });
    } else {
      toast("등록에 실패했습니다");
    }
  };

  const handleAddReply = async () => {
    if (!user || !replyTo || !replyText.trim()) return;
    const result = await addReply(replyTo.echoId, data.id, user.id, replyText.trim());
    if (result) {
      setEchoes(prev => prev.map((e, i) =>
        i === replyTo.echoIndex
          ? { ...e, replies: [...(e.replies || []), { id: crypto.randomUUID(), userId: user.id, userName: "나", text: replyText.trim(), isSameLine: false, parentId: replyTo.echoId }] }
          : e
      ));
      setReplyText("");
      setReplyTo(null);
    } else {
      toast("등록에 실패했습니다");
    }
  };

  const handleDeleteEcho = async () => {
    if (!confirmDelete || confirmDelete.type !== "echo") return;
    const { echoId, echoIndex, isReply, parentIndex } = confirmDelete;

    if (isReply && parentIndex !== undefined) {
      // Delete a reply
      const parent = echoes[parentIndex];
      const reply = parent.replies?.find(r => r.id === echoId);
      if (reply && !reply.isPrivate) {
        const ok = await deleteEcho(echoId!);
        if (!ok) { toast("삭제에 실패했습니다"); setConfirmDelete(null); return; }
      }
      setEchoes(prev => prev.map((e, i) =>
        i === parentIndex ? { ...e, replies: (e.replies || []).filter(r => r.id !== echoId) } : e
      ));
    } else {
      // Delete top-level echo
      const echo = echoes[echoIndex!];
      if (echo?.isPrivate) {
        const ok = await deletePrivateMemo(echoId!);
        if (!ok) { toast("삭제에 실패했습니다"); setConfirmDelete(null); return; }
      } else {
        const ok = await deleteEcho(echoId!);
        if (!ok) { toast("삭제에 실패했습니다"); setConfirmDelete(null); return; }
      }
      setEchoes(prev => prev.filter((_, i) => i !== echoIndex));
    }
    setConfirmDelete(null);
    toast("삭제되었습니다");
  };

  const handleDeleteLine = async () => {
    if (!confirmDelete || confirmDelete.type !== "line") return;
    const ok = await deleteUnderline(data.id);
    if (ok) { toast("삭제되었습니다"); setConfirmDelete(null); goBack(); }
    else toast("삭제에 실패했습니다");
  };

  const handlePin = async (echoId: string, echoIndex: number) => {
    const echo = echoes[echoIndex];
    const newPinned = !echo.pinned;
    const ok = await pinEcho(echoId, data.id, newPinned);
    if (ok) {
      setEchoes(prev => {
        const updated = prev.map((e, i) => ({ ...e, pinned: i === echoIndex ? newPinned : false }));
        updated.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        return updated;
      });
      toast(newPinned ? "댓글을 고정했습니다" : "고정을 해제했습니다");
    } else {
      toast("고정에 실패했습니다");
    }
  };

  const handleRequestDelete = (info: { echoId: string; echoIndex: number; isReply?: boolean; parentIndex?: number }) => {
    setConfirmDelete({ type: "echo", echoId: info.echoId, echoIndex: info.echoIndex, isReply: info.isReply, parentIndex: info.parentIndex });
  };

  const handleReportEcho = async (echoId: string) => {
    if (!user) { requireAuth(); return; }
    if (!window.confirm("이 댓글을 신고하시겠습니까?")) return;
    const ok = await reportContent(user.id, "echo", echoId);
    toast(ok ? "신고되었습니다" : "신고에 실패했습니다");
  };

  const handleReportLine = async (reason: string) => {
    if (!user) { requireAuth(); return; }
    const ok = await reportContent(user.id, "underline", data.id, reason);
    toast(ok ? "신고되었습니다" : "신고에 실패했습니다");
  };

  const handleHidePerson = async () => {
    if (!user) { requireAuth(); return; }
    const ok = await blockUser(user.id, data.userId);
    if (ok) { toast("이 작가의 한줄이 더 이상 표시되지 않습니다"); goBack(); }
    else toast("처리에 실패했습니다");
  };

  const handleHideBook = async () => {
    if (!user) { requireAuth(); return; }
    const ok = await blockBook(user.id, data.bookId);
    if (ok) { toast("이 책의 한줄이 더 이상 표시되지 않습니다"); goBack(); }
    else toast("처리에 실패했습니다");
  };

  const handleNotInterested = async () => {
    if (!user) { requireAuth(); return; }
    const ok = await blockUnderline(user.id, data.id);
    if (ok) { toast("관심 없음으로 표시했습니다"); goBack(); }
    else toast("처리에 실패했습니다");
  };

  const handleSetPrivate = async () => {
    if (!user) { requireAuth(); return; }
    const newPrivate = !isPrivate;
    const ok = await setLinePrivate(data.id, newPrivate);
    if (ok) {
      setIsPrivate(newPrivate);
      toast(newPrivate ? "나만 보기로 변경했습니다" : "공개로 전환했습니다");
    } else {
      toast("처리에 실패했습니다");
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  return (
    <div className="content-fade-in">
      <button className="backbtn" onClick={goBack}><Icons.Back /> 뒤로</button>

      <div style={{ padding: "8px 20px 20px" }}>
        <div className="ptop">
          <div className="pava" style={{ background: data.coverColor + "40" }} onClick={() => navigate(`/@${data.userHandle}`)}>
            {data.userAvatar}
          </div>
          <div className="pmeta">
            <span className="pname" onClick={() => navigate(`/@${data.userHandle}`)}>{data.userName}</span>
            <div className="pbref" onClick={() => navigate(`/book/${encodeURIComponent(data.bookTitle)}`, { state: { author: data.bookAuthor } })}>
              {data.bookTitle} · {data.bookAuthor}
            </div>
          </div>
          <span className="ptime">
            {isPrivate && isPostAuthor && <span className="private-badge">🔒</span>}
            {timeAgo(data.createdAt)}
          </span>
        </div>

        <div className="qwrap">
          <p className="qtxt">{data.quote}</p>
          <div className="qsrc">
            <span>{data.bookTitle}</span><span className="qdot" /><span>{data.bookAuthor}</span>
            {data.page > 0 && <><span className="qdot" /><span>p.{data.page}</span></>}
          </div>
        </div>

        {data.feeling && (!data.feelingPrivate || isPostAuthor) && (
          <p className="pfeel">
            {data.feeling}
            {data.feelingPrivate && <span className="pfeel-private-tag">나만 보기</span>}
          </p>
        )}

        <LineActions
          saved={saved}
          isLoggedIn={!!user}
          isPostAuthor={isPostAuthor}
          onSave={handleSave}
          onShare={() => setShowShare(true)}
          onDeleteLine={() => setConfirmDelete({ type: "line" })}
          onAuthRequired={requireAuth}
          onReport={isPostAuthor ? undefined : handleReportLine}
          onHidePerson={isPostAuthor ? undefined : handleHidePerson}
          onHideBook={isPostAuthor ? undefined : handleHideBook}
          onNotInterested={isPostAuthor ? undefined : handleNotInterested}
          onSetPrivate={isPostAuthor ? handleSetPrivate : undefined}
          isPrivate={isPrivate}
          onEdit={isPostAuthor ? () => navigate(`/write`, { state: { editId: data.id, editQuote: data.quote, editFeeling: data.feeling, editBookTitle: data.bookTitle, editBookAuthor: data.bookAuthor, editPage: data.page } }) : undefined}
          onAddToNote={() => setShowAddToNote(true)}
        />

        <EchoList
          echoes={echoes}
          isPostAuthor={isPostAuthor}
          currentUserId={user?.id}
          onDelete={handleRequestDelete}
          onPin={handlePin}
          onReplyTo={setReplyTo}
          onReport={handleReportEcho}
          replyToIndex={replyTo?.echoIndex ?? null}
          replyInput={replyTo ? (
            <ReplyInput
              replyTo={replyTo}
              replyText={replyText}
              onReplyTextChange={setReplyText}
              onAddReply={handleAddReply}
              onCancel={() => { setReplyTo(null); setReplyText(""); }}
            />
          ) : null}
          echoInput={
            <EchoInput
              isLoggedIn={!!user}
              onAddEcho={handleAddEcho}
              onToast={toast}
              onAuthRequired={requireAuth}
            />
          }
        />

        {/* 같은 한줄, 다른 시선 */}
        {sameQuoteLines.length > 0 && (
          <div className="detail-others">
            <button className={`detail-others-toggle ${showSameQuote ? "open" : ""}`} onClick={() => setShowSameQuote(!showSameQuote)}>
              <span>같은 한줄, 다른 시선 {sameQuoteLines.length}</span>
              <span className="detail-others-chevron"><Icons.ChevD /></span>
            </button>
            {showSameQuote && sameQuoteLines.map((sl) => (
              <div key={sl.id} className="detail-other-card" onClick={() => navigate(`/@${sl.userHandle}/lines/${sl.shortId}`)}>
                {sl.feeling
                  ? <div className="detail-other-feeling">{sl.feeling}</div>
                  : <div className="detail-other-feeling" style={{ opacity: 0.5 }}>같은 문장, 다른 시선</div>
                }
                <div className="detail-other-meta"><span>{sl.userName}</span></div>
              </div>
            ))}
          </div>
        )}

        <OtherLines otherLines={data.otherLines || []} />
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="confirm-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-msg">{confirmDelete.type === "line" ? "이 한 줄을 삭제할까요?" : "이 댓글을 삭제할까요?"}</div>
            <div className="confirm-sub">삭제하면 되돌릴 수 없습니다</div>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmDelete(null)}>취소</button>
              <button className="confirm-delete" onClick={confirmDelete.type === "line" ? handleDeleteLine : handleDeleteEcho}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {showAddToNote && user && (
        <AddToNoteSheet
          userId={user.id}
          lineId={data.id}
          onClose={() => setShowAddToNote(false)}
          onSuccess={(title) => {
            setShowAddToNote(false);
            toast(title ? `"${title}" 노트에 담았습니다` : "노트에 담기에 실패했습니다");
          }}
        />
      )}

      {showToast && <Toast message={toastMsg} />}
      {showShare && data && (
        <ShareModal
          post={{
            id: data.id, shortId: data.shortId, userId: data.userId, userName: data.userName,
            book: { title: data.bookTitle, author: data.bookAuthor, page: data.page },
            quote: data.quote, feeling: data.feeling ?? "", coverColor: data.coverColor,
            timestamp: "", likes: 0, topic: "", echoes: [], otherLines: [],
          }}
          onClose={() => setShowShare(false)} toast={toast}
        />
      )}
    </div>
  );
}
