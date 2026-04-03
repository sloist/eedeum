import { useState, useEffect, useRef } from "react";
import { Icons } from "./Icons";

type Props = {
  saved: boolean;
  isLoggedIn: boolean;
  isPostAuthor: boolean;
  onSave: () => void;
  onShare: () => void;
  onDeleteLine: () => void;
  onAuthRequired?: () => void;
  onReport?: (reason: string) => void;
  onHidePerson?: () => void;
  onHideBook?: () => void;
  onNotInterested?: () => void;
  onSetPrivate?: () => void;
  isPrivate?: boolean;
  onEdit?: () => void;
};

export function LineActions({ saved, isLoggedIn, isPostAuthor, onSave, onShare, onDeleteLine, onAuthRequired, onReport, onHidePerson, onHideBook, onNotInterested, onSetPrivate, onEdit, isPrivate }: Props) {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showReportReasons, setShowReportReasons] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMoreActions) return;
    const handle = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreActions(false);
        setShowReportReasons(false);
      }
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => { document.removeEventListener("mousedown", handle); document.removeEventListener("touchstart", handle); };
  }, [showMoreActions]);

  return (
    <div className="pacts">
      <button className={`abtn ${saved ? "on" : ""}`} onClick={onSave} aria-label="담기">
        {Icons.Bmark(saved)}
      </button>
      <button className="abtn" onClick={onShare} aria-label="카드 만들기">
        <Icons.CardMake />
      </button>
      <span className="asp" />
      <div className="pacts-more-wrap" ref={menuRef}>
        <button className="abtn" onClick={() => {
          if (!isLoggedIn) { onAuthRequired?.(); return; }
          setShowMoreActions(!showMoreActions); setShowReportReasons(false);
        }} aria-label="더보기">
          <Icons.More />
        </button>
        {showMoreActions && (
          <div className="pacts-more-menu">
            {isPostAuthor ? (
              <>
                {onSetPrivate && (
                  <button onClick={() => { onSetPrivate(); setShowMoreActions(false); }}>
                    {isPrivate ? "공개로 전환" : "나만 보기"}
                  </button>
                )}
                {onEdit && (
                  <button onClick={() => { onEdit(); setShowMoreActions(false); }}>
                    수정
                  </button>
                )}
                <button className="danger" onClick={() => { onDeleteLine(); setShowMoreActions(false); }}>
                  삭제
                </button>
              </>
            ) : showReportReasons ? (
              <>
                <button className="pacts-more-back" onClick={() => setShowReportReasons(false)}>
                  ← 돌아가기
                </button>
                <button onClick={() => { onReport?.("욕설/비하"); setShowMoreActions(false); setShowReportReasons(false); }}>
                  욕설 · 비하
                </button>
                <button onClick={() => { onReport?.("음란/선정"); setShowMoreActions(false); setShowReportReasons(false); }}>
                  음란 · 선정
                </button>
                <button onClick={() => { onReport?.("분란/정치"); setShowMoreActions(false); setShowReportReasons(false); }}>
                  분란 · 정치
                </button>
              </>
            ) : (
              <>
                {onHidePerson && (
                  <button onClick={() => { onHidePerson(); setShowMoreActions(false); }}>
                    이 작가 한줄 안 보기
                  </button>
                )}
                {onNotInterested && (
                  <button onClick={() => { onNotInterested(); setShowMoreActions(false); }}>
                    관심 없음
                  </button>
                )}
                {onHideBook && (
                  <button onClick={() => { onHideBook(); setShowMoreActions(false); }}>
                    이 책 안 보기
                  </button>
                )}
                {onReport && (
                  <button onClick={() => setShowReportReasons(true)}>
                    신고하기
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
