import { useState } from "react";

interface RepostSheetProps {
  quote: string;
  bookTitle: string;
  bookAuthor: string;
  originalUserName: string;
  onClose: () => void;
  onSubmit: (feeling: string) => void;
  submitting?: boolean;
}

export function RepostSheet({ quote, bookTitle, bookAuthor, originalUserName, onClose, onSubmit, submitting }: RepostSheetProps) {
  const [feeling, setFeeling] = useState("");

  return (
    <div className="ov" onClick={onClose}>
      <div className="sht" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="shndl" />
        <div style={{ fontFamily: "var(--sn)", fontSize: 15, fontWeight: 600, marginBottom: 16, color: "var(--t1)" }}>
          내 한줄로 공유
        </div>

        <div style={{
          padding: "14px 16px",
          background: "var(--bgW)",
          borderRadius: 10,
          borderLeft: "2.5px solid var(--ac)",
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 14, color: "var(--t1)", lineHeight: 1.6, margin: 0 }}>{quote}</p>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 8 }}>
            {bookTitle} · {bookAuthor}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
            {originalUserName}님의 한줄
          </div>
        </div>

        <textarea
          value={feeling}
          onChange={e => setFeeling(e.target.value)}
          placeholder="이 문장에 대한 내 생각을 남겨보세요"
          maxLength={200}
          style={{
            width: "100%",
            minHeight: 80,
            padding: "12px 14px",
            border: "1px solid var(--bdL)",
            borderRadius: 10,
            fontFamily: "var(--sn)",
            fontSize: 14,
            color: "var(--t1)",
            background: "var(--bgC)",
            resize: "none",
            outline: "none",
            lineHeight: 1.6,
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              background: "var(--bgW)",
              color: "var(--t2)",
              fontFamily: "var(--sn)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={() => onSubmit(feeling.trim())}
            disabled={submitting}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              background: "var(--t1)",
              color: "var(--bgC)",
              fontFamily: "var(--sn)",
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "공유 중..." : "공유하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
