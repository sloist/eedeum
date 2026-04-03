import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export type Echo = {
  id: string; userId: string; userName: string; text: string;
  isSameLine: boolean; isPrivate?: boolean;
  parentId?: string | null; pinned?: boolean;
  replies?: Echo[];
};

type ContextMenu = {
  echoId: string; echoIndex: number; x: number; y: number;
  isReply?: boolean; parentIndex?: number;
} | null;

type Props = {
  echoes: Echo[];
  isPostAuthor: boolean;
  currentUserId?: string;
  onDelete: (info: { echoId: string; echoIndex: number; isReply?: boolean; parentIndex?: number }) => void;
  onPin: (echoId: string, echoIndex: number) => void;
  onReplyTo: (info: { echoId: string; echoIndex: number; userName: string }) => void;
  onReport?: (echoId: string) => void;
  replyToIndex: number | null;
  replyInput: React.ReactNode;
  echoInput: React.ReactNode;
};

export function EchoList({ echoes, isPostAuthor, currentUserId, onDelete, onPin, onReplyTo, onReport, replyToIndex, replyInput, echoInput }: Props) {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const handle = () => setContextMenu(null);
    document.addEventListener("touchstart", handle);
    document.addEventListener("mousedown", handle);
    return () => { document.removeEventListener("touchstart", handle); document.removeEventListener("mousedown", handle); };
  }, [contextMenu]);

  const startLongPress = (echoId: string, echoIndex: number, _echo: Echo, e: React.TouchEvent | React.MouseEvent, isReply?: boolean, parentIndex?: number) => {
    if (!currentUserId) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ echoId, echoIndex, x: clientX, y: clientY, isReply, parentIndex });
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  return (
    <>
      <div className="echos">
        {echoes.map((e, i) => (
          <div key={e.id}>
            {/* Top-level echo */}
            <div
              className={`eitem ${e.isPrivate ? "eitem-private" : ""} ${e.pinned ? "eitem-pinned" : ""}`}
              onTouchStart={(ev) => startLongPress(e.id, i, e, ev)}
              onTouchEnd={cancelLongPress} onTouchMove={cancelLongPress}
              onMouseDown={(ev) => startLongPress(e.id, i, e, ev)}
              onMouseUp={cancelLongPress} onMouseLeave={cancelLongPress}
            >
              {e.pinned && <span className="epin-label">고정됨</span>}
              <span className="edot" />
              <div className="etxt">
                <span className="eusr" onClick={() => e.userId !== currentUserId && e.userId !== "me" && navigate(`/user/${e.userId}`)}>{e.userName}</span>
                {e.text}
                {e.isPrivate && <span className="eprivate-tag">나만 보기</span>}
              </div>
            </div>
            {/* Replies */}
            {e.replies && e.replies.map((r) => (
              <div
                key={r.id}
                className="eitem eitem-reply"
                onTouchStart={(ev) => startLongPress(r.id, i, r, ev, true, i)}
                onTouchEnd={cancelLongPress} onTouchMove={cancelLongPress}
                onMouseDown={(ev) => startLongPress(r.id, i, r, ev, true, i)}
                onMouseUp={cancelLongPress} onMouseLeave={cancelLongPress}
              >
                <span className="edot" />
                <div className="etxt">
                  <span className="eusr eusr-author">{r.userName}</span>
                  <span className="ereply-label">작성자</span>
                  {r.text}
                </div>
              </div>
            ))}
            {/* Reply button — only for post author, on others' comments */}
            {isPostAuthor && e.userId !== currentUserId && !e.isPrivate && (
              <button className="ereply-btn" onClick={() => onReplyTo({ echoId: e.id, echoIndex: i, userName: e.userName })}>
                답글
              </button>
            )}
            {/* Reply input */}
            {replyToIndex === i && replyInput}
          </div>
        ))}
        {echoInput}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div className="echo-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          {(() => {
            const echo = contextMenu.isReply && contextMenu.parentIndex !== undefined
              ? echoes[contextMenu.parentIndex]?.replies?.find(r => r.id === contextMenu.echoId)
              : echoes[contextMenu.echoIndex];
            const canManage = echo && (echo.userId === currentUserId || echo.userId === "me" || isPostAuthor);
            return <>
              {canManage && (
                <button onClick={() => { onDelete({ echoId: contextMenu.echoId, echoIndex: contextMenu.echoIndex, isReply: contextMenu.isReply, parentIndex: contextMenu.parentIndex }); setContextMenu(null); }}>
                  삭제
                </button>
              )}
              {isPostAuthor && !contextMenu.isReply && (
                <button onClick={() => { onPin(contextMenu.echoId, contextMenu.echoIndex); setContextMenu(null); }}>
                  {echoes[contextMenu.echoIndex]?.pinned ? "고정 해제" : "고정"}
                </button>
              )}
              {onReport && (
                <button onClick={() => { onReport(contextMenu.echoId); setContextMenu(null); }}>
                  신고
                </button>
              )}
            </>;
          })()}
        </div>
      )}
    </>
  );
}
