import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { TOPICS } from "../data";
import { findOrCreateBook, createLine, fetchBooks } from "../lib/api";
import { searchBooks } from "../lib/bookSearch";
import { playSoundIf, playLineSaved } from "../lib/sounds";

interface CaptureSheetProps {
  onClose: (newPostId?: string) => void;
  toast: (msg: string) => void;
}

export function CaptureSheet({ onClose, toast }: CaptureSheetProps) {
  const { user } = useAuth();
  const [quote, setQuote] = useState("");
  const [feeling, setFeeling] = useState("");
  const [showSource, setShowSource] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [page, setPage] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [bookResults, setBookResults] = useState<{ id?: string; title: string; author: string; thumbnail?: string }[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!bookSearch.trim()) { setBookResults([]); return; }
    let mounted = true;
    const timer = setTimeout(async () => {
      const kakaoResults = await searchBooks(bookSearch.trim());
      if (!mounted) return;
      if (kakaoResults.length > 0) {
        setBookResults(kakaoResults.slice(0, 8).map(r => ({ title: r.title, author: r.author, thumbnail: r.thumbnail })));
        return;
      }
      const books = await fetchBooks();
      if (!mounted) return;
      const q = bookSearch.trim().toLowerCase();
      setBookResults(books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)).slice(0, 5).map(b => ({ id: b.id, title: b.title, author: b.author })));
    }, 300);
    return () => { mounted = false; clearTimeout(timer); };
  }, [bookSearch]);

  const handleSelectBook = (book: { id?: string; title: string; author: string }) => {
    setSelectedBookId(book.id ?? null);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookSearch("");
    setBookResults([]);
  };

  const handleSubmit = async () => {
    if (!user) { toast("로그인하면 남길 수 있어요"); return; }
    if (!quote.trim()) { toast("문장을 입력해 주세요"); return; }
    if (!bookTitle.trim() || !bookAuthor.trim()) { toast("이 문장이 어디에서 왔는지 알려주세요"); return; }

    setSubmitting(true);
    let bookId = selectedBookId;
    if (!bookId) {
      const book = await findOrCreateBook(bookTitle.trim(), bookAuthor.trim());
      if (!book) { toast("잠시 후 다시 시도해보세요"); setSubmitting(false); return; }
      bookId = book.id;
    }

    const result = await createLine(user.id, bookId, quote.trim(), parseInt(page) || 0, feeling.trim() || undefined);
    setSubmitting(false);

    if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
      toast(result.error);
    } else if (result) {
      setSubmitSuccess(true);
      toast("기록에 남았습니다");
      playSoundIf(playLineSaved);
      setTimeout(() => onClose(result.id ?? undefined), 200);
    } else {
      toast("잠시 후 다시 시도해보세요");
    }
  };

  const hasSource = bookTitle.trim().length > 0;

  return (
    <div className="ov" onClick={() => onClose()}>
      <div className="sht" onClick={e => e.stopPropagation()}>
        <div className="shndl" />
        <div className="shtl">기록 남기기</div>

        {!user && (
          <div className="shelf-login-prompt" style={{ minHeight: "auto", padding: "24px 0" }}>
            <div className="shelf-login-msg">로그인하면 남길 수 있어요</div>
            <button className="shelf-login-btn" onClick={() => onClose()}>닫기</button>
          </div>
        )}

        {user && (
          <div className="cap-manual-form">
            <div className="cap-manual-scroll">
              {/* 1. 문장 — 가장 먼저, 가장 크게 */}
              <textarea
                className="ftarea cap-quote-input"
                placeholder="멈춘 문장을 남겨주세요"
                value={quote}
                onChange={e => { if (e.target.value.split("\n").length <= 12) setQuote(e.target.value); }}
                rows={4}
                autoFocus
              />

              {/* 2. 감상 — 선택, 문장 바로 아래 */}
              <textarea
                className="ftarea cap-feeling-input"
                placeholder="이 문장 앞에서 무엇이 남았나요?"
                value={feeling}
                onChange={e => { if (e.target.value.split("\n").length <= 6) setFeeling(e.target.value); }}
                rows={2}
              />

              {/* 2.5 카테고리 — 선택, 가볍게 */}
              <div className="cap-topic-area">
                <div className="cap-topic-label">가까운 결을 하나 골라보세요</div>
                <div className="cap-topic-chips">
                  {TOPICS.map((t, i) => (
                    <button
                      key={i}
                      className={`cap-topic-chip ${selectedTopic === t.label ? "on" : ""}`}
                      onClick={() => setSelectedTopic(selectedTopic === t.label ? null : t.label)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 출처 — 한 단계 뒤, 부드러운 진입 */}
              {!showSource && !hasSource ? (
                <button className="cap-source-toggle" onClick={() => setShowSource(true)}>
                  이 문장은 어디에서 왔나요?
                </button>
              ) : (
                <div className="cap-source-area">
                  <div className="cap-source-label">출처</div>
                  <div style={{ position: "relative", marginBottom: 8 }}>
                    <input
                      className="sinp"
                      placeholder="책 제목 또는 작가"
                      value={bookSearch || (bookTitle ? `${bookTitle} · ${bookAuthor}` : "")}
                      onChange={e => { setBookSearch(e.target.value); setSelectedBookId(null); setBookTitle(""); setBookAuthor(""); }}
                      onFocus={() => { if (bookTitle) setBookSearch(bookTitle); }}
                    />
                    {bookResults.length > 0 && (
                      <div className="cap-book-dropdown">
                        {bookResults.map((b, i) => (
                          <div key={i} className="brow" onClick={() => handleSelectBook(b)}>
                            {b.thumbnail && <img src={b.thumbnail} alt="" style={{ width: 28, height: 40, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />}
                            <div className="binf">
                              <div className="bint">{b.title}</div>
                              <div className="bina">{b.author}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {!selectedBookId && bookSearch.trim() && bookResults.length === 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div className="cap-new-book-notice">새 책을 등록합니다</div>
                      <input className="sinp" placeholder="책 제목" value={bookTitle} onChange={e => setBookTitle(e.target.value)} style={{ marginBottom: 6 }} />
                      <input className="sinp" placeholder="작가" value={bookAuthor} onChange={e => setBookAuthor(e.target.value)} />
                    </div>
                  )}

                  <input
                    className="sinp"
                    placeholder="페이지 번호 (선택)"
                    value={page}
                    onChange={e => setPage(e.target.value.replace(/\D/g, ""))}
                    type="text"
                    inputMode="numeric"
                    style={{ marginTop: 4 }}
                  />
                </div>
              )}
            </div>

            <div className="cap-manual-footer">
              <button
                className={`subbtn ${submitSuccess ? "subbtn-success" : ""}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "저장 중..." : "기록 남기기"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
