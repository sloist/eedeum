import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useModal } from "../lib/ModalContext";
import { Toast } from "../components/Toast";
import { Icons } from "../components/Icons";
import { findOrCreateBook, createLine, fetchBooks } from "../lib/api";
import { searchBooks } from "../lib/bookSearch";
import { createWorker } from "tesseract.js";

type OcrState = "idle" | "loading" | "done" | "error";

export function WritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { requireAuth } = useModal();

  // Image from camera/gallery
  const imageUrl = (location.state as any)?.imageUrl as string | undefined;

  const [title, setTitle] = useState("");
  const [quote, setQuote] = useState("");
  const [feeling, setFeeling] = useState("");
  const [feelingPrivate, setFeelingPrivate] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [page, setPage] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [bookResults, setBookResults] = useState<{ id?: string; title: string; author: string; thumbnail?: string }[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  // OCR state
  const [ocrState, setOcrState] = useState<OcrState>(imageUrl ? "loading" : "idle");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrLines, setOcrLines] = useState<{ text: string; selected: boolean }[]>([]);
  const [showOcrPicker, setShowOcrPicker] = useState(false);

  const toast = (msg: string) => {
    setToastMsg(msg); setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Run OCR when image is provided
  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;

    async function runOcr() {
      try {
        setOcrState("loading");
        setOcrProgress(0);
        const worker = await createWorker("kor+eng", undefined, {
          logger: (m: any) => {
            if (m.status === "recognizing text" && !cancelled) {
              setOcrProgress(Math.round(m.progress * 100));
            }
          },
        });
        const { data } = await worker.recognize(imageUrl);
        await worker.terminate();

        if (cancelled) return;

        // Split into lines, filter empty
        const lines = data.text
          .split("\n")
          .map(l => l.trim())
          .filter(l => l.length > 0)
          .map(l => ({ text: l, selected: false }));

        if (lines.length === 0) {
          setOcrState("error");
          toast("텍스트를 인식하지 못했습니다");
        } else {
          setOcrLines(lines);
          setOcrState("done");
          setShowOcrPicker(true);
        }
      } catch {
        if (!cancelled) {
          setOcrState("error");
          toast("텍스트 인식에 실패했습니다");
        }
      }
    }

    runOcr();
    return () => { cancelled = true; };
  }, [imageUrl]);

  // Toggle line selection in OCR picker
  const toggleOcrLine = (index: number) => {
    setOcrLines(prev => prev.map((l, i) => i === index ? { ...l, selected: !l.selected } : l));
  };

  // Apply selected OCR lines to quote field
  const applyOcrSelection = () => {
    const selected = ocrLines.filter(l => l.selected).map(l => l.text).join("\n");
    if (selected) {
      setQuote(prev => prev ? prev + "\n" + selected : selected);
      toast("문장이 입력되었습니다");
    }
    setShowOcrPicker(false);
  };

  // Book search
  useEffect(() => {
    if (!bookSearch.trim()) { setBookResults([]); return; }
    let mounted = true;
    const timer = setTimeout(async () => {
      const kakaoResults = await searchBooks(bookSearch.trim());
      if (!mounted) return;
      if (kakaoResults.length > 0) {
        setBookResults(kakaoResults.slice(0, 6).map(r => ({ title: r.title, author: r.author, thumbnail: r.thumbnail })));
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
    if (!user) return;
    if (!quote.trim()) { toast("문장을 입력해 주세요"); return; }
    if (!bookTitle.trim() || !bookAuthor.trim()) { toast("출처를 입력해 주세요"); return; }

    setSubmitting(true);
    let bookId = selectedBookId;
    if (!bookId) {
      const book = await findOrCreateBook(bookTitle.trim(), bookAuthor.trim());
      if (!book) { toast("잠시 후 다시 시도해보세요"); setSubmitting(false); return; }
      bookId = book.id;
    }

    const result = await createLine(user.id, bookId, quote.trim(), parseInt(page) || 0, feeling.trim() || undefined, title.trim() || undefined, feelingPrivate);
    setSubmitting(false);

    if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
      toast(result.error);
    } else if (result) {
      toast("기록이 남았습니다");
      setTimeout(() => navigate("/", { replace: true }), 300);
    } else {
      toast("잠시 후 다시 시도해보세요");
    }
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="shelf-login-prompt">
        <div className="shelf-login-lead">기록</div>
        <div className="shelf-login-msg">멈춘 문장을 여기에 남겨두세요</div>
        <button className="shelf-login-btn" onClick={() => requireAuth()}>로그인하고 기록하기</button>
      </div>
    );
  }

  const hasSource = bookTitle.trim().length > 0;

  return (
    <div className="write-page">
      {/* Header */}
      <div className="write-header">
        <button className="write-cancel" onClick={() => {
          const hasContent = quote.trim() || feeling.trim() || title.trim();
          if (hasContent && !window.confirm("작성 중인 내용이 사라집니다. 나가시겠습니까?")) return;
          if (location.pathname === "/my") navigate("/");
          else navigate(-1);
        }}>취소</button>
        <button
          className={`write-submit ${quote.trim() && hasSource ? "write-submit-active" : ""}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "저장 중..." : "기록하기"}
        </button>
      </div>

      {/* OCR Loading */}
      {ocrState === "loading" && (
        <div className="ocr-loading">
          <div className="ocr-loading-text">텍스트를 인식하고 있습니다...</div>
          <div className="ocr-progress-bar">
            <div className="ocr-progress-fill" style={{ width: `${ocrProgress}%` }} />
          </div>
          <div className="ocr-progress-pct">{ocrProgress}%</div>
        </div>
      )}

      {/* OCR Image Preview */}
      {imageUrl && ocrState !== "loading" && (
        <div className="ocr-preview">
          <img src={imageUrl} alt="촬영된 이미지" className="ocr-preview-img" />
          {ocrState === "done" && (
            <button className="ocr-reopen-btn" onClick={() => setShowOcrPicker(true)}>
              인식된 텍스트 다시 보기
            </button>
          )}
        </div>
      )}

      {/* OCR Text Picker Modal */}
      {showOcrPicker && (
        <div className="ocr-picker-backdrop" onClick={() => setShowOcrPicker(false)}>
          <div className="ocr-picker" onClick={e => e.stopPropagation()}>
            <div className="ocr-picker-title">사용할 문장을 선택하세요</div>
            <div className="ocr-picker-hint">터치해서 선택 · 여러 줄 선택 가능</div>
            <div className="ocr-picker-lines">
              {ocrLines.map((line, i) => (
                <div
                  key={i}
                  className={`ocr-line ${line.selected ? "ocr-line-on" : ""}`}
                  onClick={() => toggleOcrLine(i)}
                >
                  {line.text}
                </div>
              ))}
            </div>
            <div className="ocr-picker-actions">
              <button className="ocr-picker-cancel" onClick={() => setShowOcrPicker(false)}>취소</button>
              <button
                className="ocr-picker-apply"
                onClick={applyOcrSelection}
                disabled={!ocrLines.some(l => l.selected)}
              >
                선택한 문장 넣기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Writing space */}
      <div className="write-body">
        {/* 주인공: 문장 */}
        <div className="write-stage">
          <textarea
            className="write-quote"
            placeholder="멈춘 문장을 남겨주세요"
            value={quote}
            onChange={e => { if (e.target.value.split("\n").length <= 15) setQuote(e.target.value); }}
            rows={6}
            autoFocus={!imageUrl}
          />
          <label className="write-camera-icon">
            <Icons.Camera />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  navigate("/write", { state: { imageUrl: reader.result as string }, replace: true });
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>

        {/* 나의 감상 — 다른 온도 */}
        <div className="write-feeling-wrap">
          <input
            className="write-title"
            placeholder="제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={50}
          />
          <textarea
            className="write-feeling"
            placeholder="떠오른 생각이 있다면"
            value={feeling}
            onChange={e => { if (e.target.value.split("\n").length <= 10) setFeeling(e.target.value); }}
            rows={3}
          />
          {feeling.trim() && (
            <button
              className={`write-feeling-private ${feelingPrivate ? "on" : ""}`}
              onClick={() => setFeelingPrivate(!feelingPrivate)}
              type="button"
            >
              {feelingPrivate ? "나만 보기" : "공개"}
            </button>
          )}
        </div>

        {/* 출처 — 가장 조용하게 */}
        <div className="write-source">
          <div className="write-source-label">출처</div>
          <div style={{ position: "relative" }}>
            <input
              className="write-input"
              placeholder="책 제목 또는 작가 검색"
              value={bookSearch || (bookTitle ? `${bookTitle} · ${bookAuthor}` : "")}
              onChange={e => { setBookSearch(e.target.value); setSelectedBookId(null); setBookTitle(""); setBookAuthor(""); }}
              onFocus={() => { if (bookTitle) setBookSearch(bookTitle); }}
            />
            {bookResults.length > 0 && (
              <div className="write-book-dropdown">
                {bookResults.map((b, i) => (
                  <div key={i} className="write-book-row" onClick={() => handleSelectBook(b)}>
                    {b.thumbnail && <img src={b.thumbnail} alt="" className="write-book-thumb" />}
                    <div>
                      <div className="write-book-title">{b.title}</div>
                      <div className="write-book-author">{b.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!selectedBookId && bookSearch.trim() && bookResults.length === 0 && (
            <div className="write-new-book">
              <div className="write-new-book-label">새 책을 등록합니다</div>
              <input className="write-input" placeholder="책 제목" value={bookTitle} onChange={e => setBookTitle(e.target.value)} />
              <input className="write-input" placeholder="작가" value={bookAuthor} onChange={e => setBookAuthor(e.target.value)} style={{ marginTop: 6 }} />
            </div>
          )}

          <input
            className="write-input"
            placeholder="페이지 번호 (선택)"
            value={page}
            onChange={e => setPage(e.target.value.replace(/\D/g, ""))}
            type="text"
            inputMode="numeric"
            style={{ marginTop: 8 }}
          />
        </div>
      </div>

      {showToast && <Toast message={toastMsg} />}
    </div>
  );
}
