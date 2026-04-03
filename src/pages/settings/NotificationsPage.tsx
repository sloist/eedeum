import { useState } from "react";

function getNotifSetting(key: string): boolean {
  const val = localStorage.getItem(`eedeum_notif_${key}`);
  return val === null ? true : val === "true";
}

function setNotifSetting(key: string, value: boolean) {
  localStorage.setItem(`eedeum_notif_${key}`, String(value));
}

export function NotificationsPage() {
  const [likeNotif, setLikeNotif] = useState(getNotifSetting("likes"));
  const [echoNotif, setEchoNotif] = useState(getNotifSetting("echoes"));

  const toggle = (key: string, current: boolean, setter: (v: boolean) => void) => {
    const next = !current;
    setter(next);
    setNotifSetting(key, next);
  };

  return (
    <div className="content-fade-in settings-sub-page">

      <div className="settings-list">
        <button className="settings-item" onClick={() => toggle("likes", likeNotif, setLikeNotif)}>
          <span>공감 알림</span>
          <span className={`settings-toggle-label ${likeNotif ? "settings-toggle-on" : "settings-toggle-off"}`}>
            {likeNotif ? "ON" : "OFF"}
          </span>
        </button>
        <button className="settings-item" onClick={() => toggle("echoes", echoNotif, setEchoNotif)}>
          <span>댓글 알림</span>
          <span className={`settings-toggle-label ${echoNotif ? "settings-toggle-on" : "settings-toggle-off"}`}>
            {echoNotif ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      <p className="settings-note" style={{ marginTop: 20 }}>
        이듬은 푸시 알림을 보내지 않습니다.<br />
        앱을 열었을 때 확인할 수 있습니다.
      </p>
    </div>
  );
}
