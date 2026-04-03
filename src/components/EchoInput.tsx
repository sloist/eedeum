import { useState } from "react";
import { Icons } from "./Icons";

type Props = {
  isLoggedIn: boolean;
  onAddEcho: (text: string, isPrivate: boolean) => void;
  onToast: (msg: string) => void;
  onAuthRequired?: () => void;
};

export function EchoInput({ isLoggedIn, onAddEcho, onToast, onAuthRequired }: Props) {
  const [echoText, setEchoText] = useState("");
  const [privateMode, setPrivateMode] = useState(false);

  const handleSubmit = () => {
    if (!echoText.trim()) return;
    onAddEcho(echoText, privateMode);
    setEchoText("");
  };

  return (
    <div className="einwrap">
      {isLoggedIn ? (
        <div className="einput-group">
          <input
            className="einput"
            placeholder="이 문장 앞에서 떠오른 생각을 남겨보세요"
            value={echoText}
            onChange={e => setEchoText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSubmit(); }}
          />
          <button
            className={`einput-private-btn ${privateMode ? "on" : ""}`}
            onClick={() => setPrivateMode(!privateMode)}
          >
            {privateMode ? <Icons.Lock /> : <Icons.Unlock />}
          </button>
        </div>
      ) : (
        <input className="einput einput-locked" placeholder="이 문장 앞에서 떠오른 생각을 남겨보세요" readOnly onClick={() => onAuthRequired ? onAuthRequired() : onToast("로그인하면 남길 수 있어요")} />
      )}
    </div>
  );
}

type ReplyInputProps = {
  replyTo: { echoId: string; echoIndex: number; userName: string };
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onAddReply: () => void;
  onCancel: () => void;
};

export function ReplyInput({ replyTo, replyText, onReplyTextChange, onAddReply, onCancel }: ReplyInputProps) {
  return (
    <div className="ereply-input-wrap">
      <input
        className="einput ereply-input"
        placeholder={`${replyTo.userName}님에게 답글`}
        value={replyText}
        onChange={ev => onReplyTextChange(ev.target.value)}
        onKeyDown={ev => { if (ev.key === "Enter" && !ev.nativeEvent.isComposing) onAddReply(); }}
        autoFocus
      />
      <button className="ereply-cancel" onClick={onCancel}>취소</button>
    </div>
  );
}
