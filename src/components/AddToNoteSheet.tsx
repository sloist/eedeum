import { useState, useEffect } from "react";
import { fetchUserWeaves, createWeave, fetchWeaveBlocks, addWeaveBlock } from "../lib/api";

interface Weave {
  id: string;
  title: string;
  coverColor: string;
  blockCount: number;
}

interface Props {
  userId: string;
  lineId: string;
  onClose: () => void;
  onSuccess: (noteTitle: string) => void;
}

const SPINE_COLORS = ["#8B7355", "#6B8E7B", "#7B6E8E", "#8E7B6B", "#6B7B8E", "#8E6B7B"];

export function AddToNoteSheet({ userId, lineId, onClose, onSuccess }: Props) {
  const [weaves, setWeaves] = useState<Weave[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchUserWeaves(userId).then(data => {
      setWeaves(data.map((w: any) => ({
        id: w.id,
        title: w.title,
        coverColor: w.coverColor,
        blockCount: w.blockCount,
      })));
      setLoading(false);
    });
  }, [userId]);

  const handleSelect = async (weave: Weave) => {
    if (adding) return;
    setAdding(true);
    try {
      const blocks = await fetchWeaveBlocks(weave.id);
      const position = blocks.length;
      await addWeaveBlock(weave.id, "underline", position, lineId);
      onSuccess(weave.title);
    } catch {
      onSuccess("");
    }
    setAdding(false);
  };

  const handleCreateNew = async () => {
    if (!newTitle.trim() || adding) return;
    setAdding(true);
    try {
      const color = SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)];
      const result = await createWeave(userId, newTitle.trim(), color);
      if ("data" in result && result.data) {
        await addWeaveBlock(result.data.id, "underline", 0, lineId);
        onSuccess(newTitle.trim());
      } else {
        onSuccess("");
      }
    } catch {
      onSuccess("");
    }
    setAdding(false);
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="sht" onClick={e => e.stopPropagation()}>
        <div className="sht-bar" />
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ fontSize: 15, fontFamily: "var(--sn)", fontWeight: 500, color: "var(--t1)", marginBottom: 4 }}>
            노트에 담기
          </div>

          {loading ? (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--t3)" }}>
              불러오는 중...
            </div>
          ) : (
            <div className="note-sheet-list">
              {weaves.map(w => (
                <div key={w.id} className="note-sheet-item" onClick={() => handleSelect(w)}>
                  <div className="note-sheet-spine" style={{ background: w.coverColor }} />
                  <div>
                    <div className="note-sheet-title">{w.title}</div>
                    <div className="note-sheet-count">{w.blockCount}개의 조각</div>
                  </div>
                </div>
              ))}

              {weaves.length === 0 && !showNew && (
                <div style={{ padding: "12px 0", fontSize: 13, color: "var(--t3)" }}>
                  아직 노트가 없습니다
                </div>
              )}

              {showNew ? (
                <div style={{ paddingTop: 8 }}>
                  <input
                    className="note-sheet-new-input"
                    placeholder="노트 제목"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreateNew()}
                    autoFocus
                    maxLength={40}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                    <button
                      style={{ fontSize: 13, color: "var(--t3)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sn)" }}
                      onClick={() => { setShowNew(false); setNewTitle(""); }}
                    >
                      취소
                    </button>
                    <button
                      style={{ fontSize: 13, color: "var(--ac)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sn)", fontWeight: 500 }}
                      onClick={handleCreateNew}
                      disabled={!newTitle.trim() || adding}
                    >
                      {adding ? "저장 중..." : "만들기"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="note-sheet-new" onClick={() => setShowNew(true)}>
                  + 새 노트 만들기
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
