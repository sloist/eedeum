import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLineDetail, fetchWeaveDetail } from "../lib/api";
import { supabase } from "../lib/supabase";
import { LoadingBar } from "../components/LoadingBar";

/** /line/:id → /@handle/lines/:shortId */
export function LegacyLineRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchLineDetail(id).then(result => {
      if (result) {
        navigate(`/@${result.userHandle}/lines/${result.shortId}`, { replace: true });
      } else {
        setFailed(true);
      }
    });
  }, [id]);

  if (failed) return <div className="empty-inline">기록을 찾을 수 없습니다</div>;
  return <LoadingBar />;
}

/** /user/:userId → /@handle */
export function LegacyUserRedirect() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("users").select("handle").eq("id", userId).single().then(({ data }) => {
      if (data?.handle) {
        navigate(`/@${data.handle}`, { replace: true });
      } else {
        setFailed(true);
      }
    });
  }, [userId]);

  if (failed) return <div className="empty-inline">사용자를 찾을 수 없습니다</div>;
  return <LoadingBar />;
}

/** /notes/:id (UUID) → /@handle/notes/:shortId */
export function LegacyNoteRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchWeaveDetail(id).then(result => {
      if (result) {
        navigate(`/@${result.userHandle}/notes/${result.shortId}`, { replace: true });
      } else {
        setFailed(true);
      }
    });
  }, [id]);

  if (failed) return <div className="empty-inline">노트를 찾을 수 없습니다</div>;
  return <LoadingBar />;
}
