import { supabase } from "../supabase";
import { checkRateLimit } from "./helpers";
import { invalidateCache } from "../cache";

async function createNotification(userId: string, type: string, actorId: string, underlineId?: string, echoId?: string) {
  if (userId === actorId) return; // Don't notify yourself
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    actor_id: actorId,
    underline_id: underlineId || null,
    echo_id: echoId || null,
  });
}

export async function toggleLike(userId: string, lineId: string): Promise<boolean | null> {
  if (!checkRateLimit("toggleLike", 20)) {
    console.warn("toggleLike rate limited");
    return null;
  }
  // Check if already liked
  const { data: existing } = await supabase
    .from("likes")
    .select("user_id")
    .eq("user_id", userId)
    .eq("underline_id", lineId)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("user_id", userId).eq("underline_id", lineId);
    invalidateCache("feed");
    return false; // unliked
  } else {
    await supabase.from("likes").insert({ user_id: userId, underline_id: lineId });
    // Notify the underline owner
    const { data: underline } = await supabase
      .from("underlines")
      .select("user_id")
      .eq("id", lineId)
      .single();
    if (underline) {
      createNotification(underline.user_id, "like", userId, lineId);
    }
    invalidateCache("feed");
    return true; // liked
  }
}

export async function toggleSave(userId: string, lineId: string): Promise<boolean | null> {
  if (!checkRateLimit("toggleSave", 20)) {
    console.warn("toggleSave rate limited");
    return null;
  }
  const { data: existing } = await supabase
    .from("saves")
    .select("user_id")
    .eq("user_id", userId)
    .eq("underline_id", lineId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saves").delete().eq("user_id", userId).eq("underline_id", lineId);
    invalidateCache("feed");
    return false;
  } else {
    await supabase.from("saves").insert({ user_id: userId, underline_id: lineId });
    invalidateCache("feed");
    return true;
  }
}

export async function addEcho(lineId: string, userId: string, text: string, isSameLine: boolean): Promise<any | { error: string } | null> {
  // Check: 1 comment per line per user (replies are separate)
  const { count } = await supabase
    .from("echoes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("underline_id", lineId)
    .is("parent_id", null);

  if ((count ?? 0) >= 1) {
    return { error: "하나의 한줄에는 댓글 하나만 남길 수 있습니다" };
  }

  const { data, error } = await supabase
    .from("echoes")
    .insert({ underline_id: lineId, user_id: userId, text, is_same_line: isSameLine })
    .select(`*, users(*)`)
    .single();

  if (error) {
    console.error("addEcho error:", error);
    return null;
  }
  // Notify the underline owner
  const { data: underline } = await supabase
    .from("underlines")
    .select("user_id")
    .eq("id", lineId)
    .single();
  if (underline) {
    createNotification(underline.user_id, "echo", userId, lineId, data.id);
  }
  invalidateCache("feed");
  return data;
}

export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", followerId).eq("following_id", followingId);
    return false;
  } else {
    await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
    createNotification(followingId, "follow", followerId);
    return true;
  }
}

export async function checkIsLiked(userId: string, lineId: string): Promise<boolean> {
  const { data } = await supabase
    .from("likes")
    .select("user_id")
    .eq("user_id", userId)
    .eq("underline_id", lineId)
    .maybeSingle();
  return !!data;
}

export async function checkIsSaved(userId: string, lineId: string): Promise<boolean> {
  const { data } = await supabase
    .from("saves")
    .select("user_id")
    .eq("user_id", userId)
    .eq("underline_id", lineId)
    .maybeSingle();
  return !!data;
}

export async function batchCheckLikedSaved(userId: string, lineIds: string[]): Promise<{ likedIds: Set<string>; savedIds: Set<string> }> {
  if (lineIds.length === 0) return { likedIds: new Set(), savedIds: new Set() };
  const [{ data: likes }, { data: saves }] = await Promise.all([
    supabase.from("likes").select("underline_id").eq("user_id", userId).in("underline_id", lineIds),
    supabase.from("saves").select("underline_id").eq("user_id", userId).in("underline_id", lineIds),
  ]);
  return {
    likedIds: new Set((likes ?? []).map(l => l.underline_id)),
    savedIds: new Set((saves ?? []).map(s => s.underline_id)),
  };
}

export async function deleteEcho(echoId: string): Promise<boolean> {
  const { error } = await supabase.from("echoes").delete().eq("id", echoId);
  invalidateCache("feed");
  return !error;
}

export async function pinEcho(echoId: string, underlineId: string, pin: boolean): Promise<boolean> {
  // Unpin all first
  if (pin) {
    await supabase.from("echoes").update({ pinned: false }).eq("underline_id", underlineId).eq("pinned", true);
  }
  const { error } = await supabase.from("echoes").update({ pinned: pin }).eq("id", echoId);
  return !error;
}

export async function addReply(parentId: string, lineId: string, userId: string, text: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("echoes")
    .insert({ underline_id: lineId, user_id: userId, text, is_same_line: false, parent_id: parentId })
    .select(`*, users(*)`)
    .single();
  if (error) { console.error("addReply error:", error); return null; }
  // Notify the parent echo's author
  const { data: parentEcho } = await supabase
    .from("echoes")
    .select("user_id")
    .eq("id", parentId)
    .single();
  if (parentEcho) {
    createNotification(parentEcho.user_id, "reply", userId, lineId, data.id);
  }
  return data;
}

export async function deleteUnderline(lineId: string): Promise<boolean> {
  // Delete related data first, then the underline
  await Promise.all([
    supabase.from("echoes").delete().eq("underline_id", lineId),
    supabase.from("likes").delete().eq("underline_id", lineId),
    supabase.from("saves").delete().eq("underline_id", lineId),
  ]);
  const { error } = await supabase.from("underlines").delete().eq("id", lineId);
  invalidateCache("feed");
  return !error;
}

export async function checkIsFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
}

export async function addPrivateMemo(userId: string, underlineId: string, text: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("private_memos")
    .insert({ user_id: userId, underline_id: underlineId, text })
    .select()
    .single();
  if (error) { console.error("addPrivateMemo error:", error); return null; }
  return data;
}

export async function deletePrivateMemo(memoId: string): Promise<boolean> {
  const { error } = await supabase.from("private_memos").delete().eq("id", memoId);
  return !error;
}

export async function fetchPrivateMemos(userId: string): Promise<{ id: string; lineId: string; text: string; date: string }[]> {
  const { data, error } = await supabase
    .from("private_memos")
    .select("id, underline_id, text, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((m: any) => ({ id: m.id, lineId: m.underline_id, text: m.text, date: m.created_at }));
}

export async function fetchPrivateMemosForLine(userId: string, underlineId: string): Promise<{ id: string; text: string; date: string }[]> {
  const { data, error } = await supabase
    .from("private_memos")
    .select("id, text, created_at")
    .eq("user_id", userId)
    .eq("underline_id", underlineId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((m: any) => ({ id: m.id, text: m.text, date: m.created_at }));
}

export async function reportContent(reporterId: string, targetType: string, targetId: string, reason?: string): Promise<boolean> {
  const { error } = await supabase.from("reports").insert({
    reporter_id: reporterId,
    target_type: targetType,
    target_id: targetId,
    reason: reason || null,
  });
  return !error;
}

export async function createLine(userId: string, bookId: string, quote: string, page: number, feeling?: string, title?: string, feelingPrivate?: boolean): Promise<any | { error: string }> {
  // Check daily limit: max 3 lines per day (global)
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
  const { count } = await supabase
    .from("underlines")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneDayAgo);

  if ((count ?? 0) >= 3) {
    return { error: "하루에 남길 수 있는 기록은 3개까지입니다" };
  }

  const insertData: any = { user_id: userId, book_id: bookId, quote, page, feeling: feeling || null, title: title || null };
  if (feelingPrivate !== undefined) insertData.feeling_private = feelingPrivate;
  const { data, error } = await supabase
    .from("underlines")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("createLine error:", error);
    return null;
  }
  invalidateCache("feed");
  return data;
}
