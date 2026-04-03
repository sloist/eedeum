import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import {
  fetchWeaveBlocks,
  fetchWeaveDetail,
  createWeave,
  updateWeave,
  addWeaveBlock,
  updateBlockPositions,
  updateWeaveBlock,
  deleteWeaveBlock,
  fetchUserLinesForWeave,
  fetchUserDbProfile,
  updateLineFeeling,
} from "../lib/api";
import { trackEvent } from "../lib/tracking";

const PRESET_COLORS = [
  "#7B6548", "#6B5B4A", "#5A6B55", "#4A5A6B",
  "#7B5A6B", "#6B5A7B", "#8B7355", "#5A6B6B",
  "#6B6555", "#8B6B5A",
];

interface WeaveBlock {
  id: string;
  type: "underline" | "note" | "divider";
  position: number;
  content: string | null;
  underline: {
    id: string;
    quote: string;
    page: number;
    feeling: string | null;
    userName: string;
    bookTitle: string;
    bookAuthor: string;
  } | null;
}

interface PickerLine {
  id: string;
  quote: string;
  page: number;
  bookTitle: string;
  bookAuthor: string;
}

export function WeaveEditorPage() {
  const navigate = useNavigate();
  const { handle, id } = useParams<{ handle: string; id: string }>();
  const { user } = useAuth();

  // Create form state
  const [isCreateMode, setIsCreateMode] = useState(!id);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createColor, setCreateColor] = useState(PRESET_COLORS[0]);
  const [createPublic, setCreatePublic] = useState(false);

  // Editor state
  const [weaveId, setWeaveId] = useState("");
  const [weaveShortId, setWeaveShortId] = useState("");
  const [myHandle, setMyHandle] = useState(handle ?? "");
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<WeaveBlock[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  // Insert menu
  const [insertAt, setInsertAt] = useState<number | null>(null);

  // Line picker
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState(0);
  const [userLines, setUserUnderlines] = useState<PickerLine[]>([]);
  const [pickerLoaded, setPickerLoaded] = useState(false);

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragStartY = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      // 미저장 feeling 타이머 flush
      Object.values(feelingTimers.current).forEach(t => clearTimeout(t));
    };
  }, []);

  // Load existing weave
  useEffect(() => {
    if (!id || !user) return;
    let mounted = true;
    async function load() {
      const [detail, dbProfile] = await Promise.all([
        fetchWeaveDetail(id!),
        fetchUserDbProfile(user!.id),
      ]);
      if (!mounted) return;
      if (detail) {
        setTitle(detail.title);
        setWeaveId(detail.id);
        setWeaveShortId(detail.shortId);
        setMyHandle(detail.userHandle);
        // detail.id는 UUID — weave_blocks 조회에 사용
        const blockData = await fetchWeaveBlocks(detail.id);
        if (!mounted) return;
        setBlocks(blockData);
      }
      if (dbProfile) setMyHandle(dbProfile.handle);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [id, user]);

  // Load user underlines for picker
  const loadUnderlines = useCallback(async () => {
    if (!user || pickerLoaded) return;
    const data = await fetchUserLinesForWeave(user.id);
    setUserUnderlines(data);
    setPickerLoaded(true);
  }, [user, pickerLoaded]);

  const handleCreate = async () => {
    if (!user || !createTitle.trim()) return;
    const result = await createWeave(user.id, createTitle.trim(), createColor, createDesc.trim() || undefined, createPublic);
    if ("error" in result) return;
    if (result.data) {
      const newId = (result.data as any).id;
      const newShortId = (result.data as any).short_id;
      setWeaveId(newId);
      setWeaveShortId(newShortId);
      setTitle(createTitle.trim());
      setIsCreateMode(false);
      // Get handle if not yet loaded
      let userHandle = myHandle;
      if (!userHandle) {
        const dbProfile = await fetchUserDbProfile(user.id);
        if (dbProfile) { userHandle = dbProfile.handle; setMyHandle(userHandle); }
      }
      trackEvent(user.id, {
        eventType: "weave_create", targetType: "weave", targetId: newId,
        source: "record", metadata: { is_public: createPublic },
      });
      if (createPublic) {
        trackEvent(user.id, {
          eventType: "weave_publish", targetType: "weave", targetId: newId,
          source: "record",
        });
      }
      navigate(`/@${userHandle}/notes/${newShortId}/edit`, { replace: true });
    }
  };

  const handleSaveTitle = async () => {
    if (!weaveId || !title.trim()) return;
    setSaving(true);
    await updateWeave(weaveId, { title: title.trim() });
    setSaving(false);
  };

  const handleInsertLine = async (ul: PickerLine) => {
    if (!weaveId) return;
    const pos = pickerPosition;
    // Shift existing blocks
    const shifted = blocks.map(b => b.position >= pos ? { ...b, position: b.position + 1 } : b);
    const result = await addWeaveBlock(weaveId, "underline", pos, ul.id);
    if (result) {
      const newBlock: WeaveBlock = {
        id: (result as any).id,
        type: "underline",
        position: pos,
        content: null,
        underline: {
          id: ul.id,
          quote: ul.quote,
          page: ul.page,
          feeling: null,
          userName: "",
          bookTitle: ul.bookTitle,
          bookAuthor: ul.bookAuthor,
        },
      };
      const newBlocks = [...shifted, newBlock].sort((a, b) => a.position - b.position);
      setBlocks(newBlocks);
      await updateBlockPositions(newBlocks.map((b, i) => ({ id: b.id, position: i })));
      setBlocks(prev => prev.map((b, i) => ({ ...b, position: i })));
    }
    if (user) {
      trackEvent(user.id, {
        eventType: "weave_add_block", targetType: "weave", targetId: weaveId,
        source: "weave", metadata: { block_type: "underline", underline_id: ul.id, book_title: ul.bookTitle },
      });
    }
    setShowPicker(false);
    setInsertAt(null);
  };

  const handleInsertNote = async (pos: number) => {
    if (!weaveId) return;
    const shifted = blocks.map(b => b.position >= pos ? { ...b, position: b.position + 1 } : b);
    const result = await addWeaveBlock(weaveId, "note", pos, undefined, "");
    if (result) {
      const newBlock: WeaveBlock = {
        id: (result as any).id,
        type: "note",
        position: pos,
        content: "",
        underline: null,
      };
      const newBlocks = [...shifted, newBlock].sort((a, b) => a.position - b.position);
      setBlocks(newBlocks);
      await updateBlockPositions(newBlocks.map((b, i) => ({ id: b.id, position: i })));
      setBlocks(prev => prev.map((b, i) => ({ ...b, position: i })));
    }
    setInsertAt(null);
  };

  const handleInsertDivider = async (pos: number) => {
    if (!weaveId) return;
    const shifted = blocks.map(b => b.position >= pos ? { ...b, position: b.position + 1 } : b);
    const result = await addWeaveBlock(weaveId, "divider", pos, undefined, "");
    if (result) {
      const newBlock: WeaveBlock = {
        id: (result as any).id,
        type: "divider",
        position: pos,
        content: "",
        underline: null,
      };
      const newBlocks = [...shifted, newBlock].sort((a, b) => a.position - b.position);
      setBlocks(newBlocks);
      await updateBlockPositions(newBlocks.map((b, i) => ({ id: b.id, position: i })));
      setBlocks(prev => prev.map((b, i) => ({ ...b, position: i })));
    }
    setInsertAt(null);
  };

  const handleDeleteBlock = async (blockId: string) => {
    const removedBlock = blocks.find(b => b.id === blockId);
    await deleteWeaveBlock(blockId);
    const newBlocks = blocks.filter(b => b.id !== blockId).map((b, i) => ({ ...b, position: i }));
    if (user && removedBlock) {
      trackEvent(user.id, {
        eventType: "weave_remove_block", targetType: "weave", targetId: weaveId,
        source: "weave", metadata: { block_type: removedBlock.type, underline_id: removedBlock.underline?.id || null },
      });
    }
    setBlocks(newBlocks);
    if (weaveId) {
      await updateBlockPositions(newBlocks.map((b, i) => ({ id: b.id, position: i })));
    }
  };

  const handleNoteChange = (blockId: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b));
  };

  const handleNoteBlur = async (blockId: string, content: string) => {
    await updateWeaveBlock(blockId, content);
  };

  const feelingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleFeelingChange = (blockId: string, underlineId: string, feeling: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId && b.underline ? { ...b, underline: { ...b.underline, feeling } } : b
    ));
    // 디바운스 자동저장 — 1.5초 후 DB 반영
    if (feelingTimers.current[underlineId]) clearTimeout(feelingTimers.current[underlineId]);
    feelingTimers.current[underlineId] = setTimeout(() => {
      updateLineFeeling(underlineId, feeling);
    }, 1500);
  };

  const handleFeelingBlur = async (underlineId: string, feeling: string) => {
    // blur 시 즉시 저장 (디바운스 취소)
    if (feelingTimers.current[underlineId]) clearTimeout(feelingTimers.current[underlineId]);
    await updateLineFeeling(underlineId, feeling);
  };

  const handleDividerChange = (blockId: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b));
  };

  const handleDividerBlur = async (blockId: string, content: string) => {
    await updateWeaveBlock(blockId, content);
  };

  // Drag handlers
  const handleDragStart = (index: number, clientY: number) => {
    setDragIndex(index);
    dragStartY.current = clientY;
  };

  const handleDragMove = (_clientY: number, currentOver: number) => {
    if (dragIndex === null) return;
    setOverIndex(currentOver);
  };

  const handleDragEnd = async () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(overIndex, 0, moved);
    const reordered = newBlocks.map((b, i) => ({ ...b, position: i }));
    setBlocks(reordered);
    setDragIndex(null);
    setOverIndex(null);
    await updateBlockPositions(reordered.map((b, i) => ({ id: b.id, position: i })));
  };

  // Touch drag support
  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      handleDragStart(index, touch.clientY);
    }, 400);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (dragIndex === null) return;
    const touch = e.touches[0];
    const elements = document.querySelectorAll(".weave-block");
    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        handleDragMove(touch.clientY, i);
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    handleDragEnd();
  };

  // Mouse drag on handle
  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(index, e.clientY);

    const onMouseMove = (ev: MouseEvent) => {
      const elements = document.querySelectorAll(".weave-block");
      for (let i = 0; i < elements.length; i++) {
        const rect = elements[i].getBoundingClientRect();
        if (ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
          setOverIndex(i);
          break;
        }
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      // Need to call handleDragEnd via a timeout so state is current
      setTimeout(() => {
        setDragIndex(prev => {
          setOverIndex(ov => {
            if (prev !== null && ov !== null && prev !== ov) {
              // Reorder
              setBlocks(currentBlocks => {
                const newBlocks = [...currentBlocks];
                const [moved] = newBlocks.splice(prev, 1);
                newBlocks.splice(ov, 0, moved);
                const reordered = newBlocks.map((b, i) => ({ ...b, position: i }));
                updateBlockPositions(reordered.map((b, i) => ({ id: b.id, position: i })));
                return reordered;
              });
            }
            return null;
          });
          return null;
        });
      }, 0);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const usedLineIds = new Set(blocks.filter(b => b.underline).map(b => b.underline!.id));

  // ─── Login Required ───
  if (!user) {
    return (
      <div className="weave-editor">
        <div className="shelf-login-prompt">
          <div className="shelf-login-msg">로그인하면 남길 수 있어요</div>
          <button className="shelf-login-btn" onClick={() => navigate("/")}>홈으로</button>
        </div>
      </div>
    );
  }

  // ─── Create Mode ───
  if (isCreateMode) {
    return (
      <div className="weave-editor">
        <div className="weave-editor-header">
          <button
            onClick={() => navigate(-1)}
            className="weave-back-btn"
          >
            ←
          </button>
          <span style={{ flex: 1 }} />
        </div>
        <div className="weave-create">
          <div className="weave-create-title">새 노트 만들기</div>

          <label className="weave-form-label">제목</label>
          <input
            className="sinp"
            placeholder="노트 제목을 입력하세요"
            value={createTitle}
            onChange={e => setCreateTitle(e.target.value)}
            style={{ marginBottom: 20 }}
          />

          <label className="weave-form-label">설명 (선택)</label>
          <textarea
            className="ftarea"
            placeholder="이 노트에 대한 짧은 설명..."
            value={createDesc}
            onChange={e => setCreateDesc(e.target.value)}
            rows={2}
            style={{ marginBottom: 20 }}
          />

          <label className="weave-form-label">표지 색상</label>
          <div className="weave-color-picker">
            {PRESET_COLORS.map(c => (
              <div
                key={c}
                className={`weave-color-dot ${createColor === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => setCreateColor(c)}
              />
            ))}
          </div>

          <div className="weave-toggle">
            <button
              type="button"
              className={`weave-toggle-switch ${createPublic ? "on" : ""}`}
              onClick={() => setCreatePublic(!createPublic)}
            />
            <span>{createPublic ? "공개" : "비공개"}</span>
          </div>

          <button
            className="subbtn"
            onClick={handleCreate}
            disabled={!createTitle.trim()}
          >
            만들기
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="weave-editor">
        <div className="weave-editor-header">
          <button
            onClick={() => navigate(-1)}
            className="weave-back-btn"
          >
            ←
          </button>
        </div>
        <div className="empty-inline">불러오는 중...</div>
      </div>
    );
  }

  // ─── Editor ───
  return (
    <div className="weave-editor">
      <div className="weave-editor-header">
        <button
          onClick={() => navigate(`/@${myHandle}/notes/${weaveShortId || id}`)}
          className="weave-back-btn"
        >
          ←
        </button>
        <input
          className="weave-title-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleSaveTitle}
          placeholder="노트 제목"
        />
        <button
          className="weave-save-btn"
          onClick={() => navigate(`/@${myHandle}/notes/${weaveShortId || id}`)}
          disabled={saving}
        >
          미리보기
        </button>
      </div>

      <div className="weave-blocks" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {/* Insert button at top */}
        <InsertButton
          position={0}
          insertAt={insertAt}
          setInsertAt={setInsertAt}
          onNote={() => handleInsertNote(0)}
          onDivider={() => handleInsertDivider(0)}
          onUnderline={() => {
            setPickerPosition(0);
            setShowPicker(true);
            loadUnderlines();
          }}
        />

        {blocks.map((block, index) => (
          <div key={block.id}>
            <div
              className={`weave-block ${dragIndex === index ? "dragging" : ""}${overIndex === index && dragIndex !== null && dragIndex !== index ? " drag-over" : ""}`}
              onTouchStart={e => handleTouchStart(index, e)}
            >
              <div
                className="weave-block-handle"
                onMouseDown={e => handleMouseDown(index, e)}
              >
                ≡
              </div>
              <button className="weave-block-delete" onClick={() => handleDeleteBlock(block.id)}>×</button>

              {block.type === "underline" && block.underline && (
                <div className="weave-block-line">
                  <div className="wb-quote">{block.underline.quote}</div>
                  <div className="wb-source">
                    — {block.underline.bookTitle}, {block.underline.bookAuthor}
                    {block.underline.page > 0 && ` · p.${block.underline.page}`}
                  </div>
                  <textarea
                    className="wb-feeling-edit"
                    value={block.underline.feeling ?? ""}
                    onChange={e => handleFeelingChange(block.id, block.underline!.id, e.target.value)}
                    onBlur={e => handleFeelingBlur(block.underline!.id, e.target.value)}
                    placeholder="이 문장에 대한 내 생각..."
                    rows={1}
                    onInput={e => {
                      const t = e.target as HTMLTextAreaElement;
                      t.style.height = "auto";
                      t.style.height = t.scrollHeight + "px";
                    }}
                  />
                </div>
              )}

              {block.type === "note" && (
                <div className="weave-block-note">
                  <textarea
                    value={block.content ?? ""}
                    onChange={e => {
                      handleNoteChange(block.id, e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onBlur={e => handleNoteBlur(block.id, e.target.value)}
                    placeholder="생각을 적어보세요..."
                    rows={5}
                    ref={el => {
                      if (el && el.scrollHeight > el.clientHeight) {
                        el.style.height = el.scrollHeight + "px";
                      }
                    }}
                  />
                </div>
              )}

              {block.type === "divider" && (
                <div className="weave-block-divider">
                  <input
                    value={block.content ?? ""}
                    onChange={e => handleDividerChange(block.id, e.target.value)}
                    onBlur={e => handleDividerBlur(block.id, e.target.value)}
                    placeholder="장 제목"
                  />
                </div>
              )}
            </div>

            <InsertButton
              position={index + 1}
              insertAt={insertAt}
              setInsertAt={setInsertAt}
              onNote={() => handleInsertNote(index + 1)}
              onDivider={() => handleInsertDivider(index + 1)}
              onUnderline={() => {
                setPickerPosition(index + 1);
                setShowPicker(true);
                loadUnderlines();
              }}
            />
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="empty-inline">첫 조각을 담아보세요</div>
        )}
      </div>

      {/* Underline Picker Overlay */}
      {showPicker && (
        <div className="ov" onClick={() => setShowPicker(false)}>
          <div className="sht" onClick={e => e.stopPropagation()}>
            <div className="shndl" />
            <div className="shtl">기록 추가</div>
            <div className="ul-picker">
              {userLines.length === 0 && (
                <div className="empty-inline">아직 기록이 없습니다</div>
              )}
              {userLines.map(ul => {
                const isUsed = usedLineIds.has(ul.id);
                return (
                  <div
                    key={ul.id}
                    className={`ul-picker-item ${isUsed ? "disabled" : ""}`}
                    onClick={() => !isUsed && handleInsertLine(ul)}
                  >
                    <div className="ul-picker-quote">{ul.quote}</div>
                    <div className="ul-picker-source">
                      {ul.bookTitle} · {ul.bookAuthor}{ul.page > 0 && ` · p.${ul.page}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsertButton({
  position,
  insertAt,
  setInsertAt,
  onNote,
  onDivider,
  onUnderline,
}: {
  position: number;
  insertAt: number | null;
  setInsertAt: (v: number | null) => void;
  onNote: () => void;
  onDivider: () => void;
  onUnderline: () => void;
}) {
  if (insertAt === position) {
    return (
      <div className="weave-insert-menu">
        <button onClick={onUnderline}>기록 추가</button>
        <button onClick={onNote}>내 글 쓰기</button>
        <button onClick={onDivider}>구분선</button>
        <button onClick={() => setInsertAt(null)} style={{ color: "var(--t3)" }}>취소</button>
      </div>
    );
  }
  return (
    <div className="weave-insert-btn">
      <button onClick={() => setInsertAt(position)}>+</button>
    </div>
  );
}
