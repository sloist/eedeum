import { useState } from "react";
import { Icons } from "./Icons";
import { USERS, ECHO_CHIPS, type Post, type Echo, type Book } from "../data";

interface PostCardProps {
  post: Post;
  idx: number;
  onUser: (uid: string) => void;
  onBook: (book: Book) => void;
  onShare: (post: Post) => void;
  toast: (msg: string) => void;
}

export function PostCard({ post, idx, onUser, onBook, onShare, toast: t }: PostCardProps) {
  const u = USERS[post.userId];
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showEch, setShowEch] = useState(false);
  const [showOL, setShowOL] = useState(false);
  const [echoTxt, setEchoTxt] = useState("");
  const [echoes, setEchoes] = useState<Echo[]>(post.echoes);

  const addE = (txt: string) => {
    if (!txt.trim()) return;
    setEchoes([...echoes, { userId: "me", text: txt }]);
    setEchoTxt("");
  };

  return (
    <div className="post" style={{ animationDelay: `${idx * 0.07}s` }}>
      <div className="ptop">
        <div className="pava" style={{ background: post.coverColor }} onClick={() => onUser(post.userId)}>{u.avatar}</div>
        <div className="pmeta">
          <span className="pname" onClick={() => onUser(post.userId)}>{u.name}</span>
          <div className="pbref" onClick={() => onBook(post.book)}>{post.book.title} · {post.book.author}</div>
        </div>
        <span className="ptime">{post.timestamp}</span>
      </div>

      <div className="qwrap" style={{ background: post.coverColor + "30" }}>
        <span className="qg">"</span>
        <p className="qtxt">{post.quote}</p>
        <div className="qsrc">
          <span>{post.book.title}</span><span className="qdot" /><span>{post.book.author}</span><span className="qdot" /><span>p.{post.book.page}</span>
        </div>
      </div>

      <p className="pfeel">{post.feeling}</p>

      <div className="pacts">
        <button className={`abtn ${liked ? "on" : ""}`} onClick={() => { setLiked(!liked); if (!liked) t("좋아요"); }}>
          {Icons.Heart(liked)}<span>{liked ? post.likes + 1 : post.likes}</span>
        </button>
        <button className={`abtn ${showEch ? "on" : ""}`} onClick={() => setShowEch(!showEch)}>
          {Icons.Chat()}<span>{echoes.length}</span>
        </button>
        <button className={`abtn ${saved ? "on" : ""}`} onClick={() => { setSaved(!saved); t(saved ? "저장 취소" : "서재에 저장"); }}>
          {Icons.Bmark(saved)}
        </button>
        <span className="asp" />
        <button className="abtn" onClick={() => onShare(post)}>{Icons.Share()}</button>
      </div>

      {showEch && (
        <div className="echos">
          {echoes.map((e, i) => {
            const eu = USERS[e.userId] || { name: "나" };
            return (
              <div key={i} className="eitem">
                <span className="edot" />
                <div className="etxt">
                  <span className="eusr" onClick={() => e.userId !== "me" && onUser(e.userId)}>{eu.name}</span>
                  {e.text}
                </div>
              </div>
            );
          })}
          <div className="echips">
            {ECHO_CHIPS.map((r, i) => <button key={i} className="echip" onClick={() => addE(r)}>{r}</button>)}
          </div>
          <div className="einwrap">
            <input className="einput" placeholder="이 문장에 대한 생각..." value={echoTxt} onChange={e => setEchoTxt(e.target.value)} onKeyDown={e => e.key === "Enter" && addE(echoTxt)} />
            <button className="esend" onClick={() => addE(echoTxt)}><Icons.Send /></button>
          </div>
        </div>
      )}

      {post.otherLines.length > 0 && (
        <div className="olines">
          <button className={`oltog ${showOL ? "open" : ""}`} onClick={() => setShowOL(!showOL)}>
            다른 사람의 밑줄 {post.otherLines.length}개 <Icons.ChevD />
          </button>
          {showOL && (
            <div className="ollist">
              {post.otherLines.map((ol, i) => {
                const ou = USERS[ol.userId] || { name: ol.userId };
                return (
                  <div key={i} className="olcard">
                    <div className="olq">"{ol.quote}"</div>
                    <div className="olinfo">
                      <span className="eusr" onClick={() => onUser(ol.userId)}>{ou.name}</span>
                      <span className="qdot" /><span>p.{ol.page}</span>
                    </div>
                  </div>
                );
              })}
              <button className="oltog" onClick={() => onBook(post.book)} style={{ marginTop: 4 }}>
                {post.book.title}의 모든 밑줄 보기 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
