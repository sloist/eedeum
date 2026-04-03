import { supabase } from "../supabase";
import { checkRateLimit } from "./helpers";
import { invalidateCache } from "../cache";
import { checkContent, checkLineContent } from "../contentFilter";

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
  // Content filter
  const filter = checkContent(text);
  if (filter.blocked) return { error: filter.reason! };

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

  const echoInsert: any = { underline_id: lineId, user_id: userId, text, is_same_line: isSameLine };
  if (filter.suspicious) {
    echoInsert.hidden = true;
    echoInsert.filter_reason = filter.reason;
  }
  const { data, error } = await supabase
    .from("echoes")
    .insert(echoInsert)
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

export async function fetchPrivateMemos(userId: string): Promise<{ id: string; lineId: string; lineHandle: string; text: string; date: string }[]> {
  const { data, error } = await supabase
    .from("private_memos")
    .select("id, underline_id, text, created_at, underlines(short_id, users!underlines_user_id_fkey(handle))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((m: any) => ({ id: m.id, lineId: (m.underlines as any)?.short_id ?? m.underline_id, lineHandle: (m.underlines as any)?.users?.handle ?? "", text: m.text, date: m.created_at }));
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
  // Content filter — 명백한 욕설은 즉시 차단
  const filter = checkLineContent(quote, feeling);
  if (filter.blocked) return { error: filter.reason! };

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
  // suspicious content → 자동 숨김 + 사유 기록
  if (filter.suspicious) {
    insertData.hidden = true;
    insertData.filter_reason = filter.reason;
  }
  const { data, error } = await supabase
    .from("underlines")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("createLine error:", error);
    return null;
  }

  // 한줄 기록 시 자동으로 서재(user_books)에 책 추가
  await supabase.from("user_books").upsert(
    { user_id: userId, book_id: bookId, status: "reading" },
    { onConflict: "user_id,book_id" }
  );

  invalidateCache("feed");
  return data;
}

// ─── 나만 보기 (비공개) ───

export async function setLinePrivate(lineId: string, isPrivate: boolean): Promise<boolean> {
  const { error } = await supabase.from("underlines").update({ is_private: isPrivate }).eq("id", lineId);
  if (!error) invalidateCache("feed");
  return !error;
}

// ─── 차단 (안 보기) ───

export async function blockUser(userId: string, targetUserId: string): Promise<boolean> {
  // 이미 차단한 경우 무시
  const { data: existing } = await supabase.from("user_blocks")
    .select("id").eq("user_id", userId).eq("block_type", "user").eq("target_id", targetUserId).maybeSingle();
  if (existing) { invalidateCache("feed"); return true; }
  const { error } = await supabase.from("user_blocks").insert({ user_id: userId, block_type: "user", target_id: targetUserId });
  if (error) console.error("blockUser error:", error);
  if (!error) invalidateCache("feed");
  return !error;
}

export async function blockBook(userId: string, bookId: string): Promise<boolean> {
  const { data: existing } = await supabase.from("user_blocks")
    .select("id").eq("user_id", userId).eq("block_type", "book").eq("target_id", bookId).maybeSingle();
  if (existing) { invalidateCache("feed"); return true; }
  const { error } = await supabase.from("user_blocks").insert({ user_id: userId, block_type: "book", target_id: bookId });
  if (error) console.error("blockBook error:", error);
  if (!error) invalidateCache("feed");
  return !error;
}

export async function blockUnderline(userId: string, underlineId: string): Promise<boolean> {
  const { data: existing } = await supabase.from("user_blocks")
    .select("id").eq("user_id", userId).eq("block_type", "underline").eq("target_id", underlineId).maybeSingle();
  if (existing) { invalidateCache("feed"); return true; }
  const { error } = await supabase.from("user_blocks").insert({ user_id: userId, block_type: "underline", target_id: underlineId });
  if (error) console.error("blockUnderline error:", error);
  if (!error) invalidateCache("feed");
  return !error;
}

export async function fetchUserBlocks(userId: string): Promise<{ blockType: string; targetId: string; label: string }[]> {
  const { data } = await supabase.from("user_blocks").select("block_type, target_id").eq("user_id", userId);
  if (!data || data.length === 0) return [];

  const blocks = data.map((b: any) => ({ blockType: b.block_type as string, targetId: b.target_id as string, label: "" }));

  // 사람 이름 조회
  const userIds = blocks.filter(b => b.blockType === "user").map(b => b.targetId);
  if (userIds.length > 0) {
    const { data: users } = await supabase.from("users").select("id, name").in("id", userIds);
    const userMap = new Map((users ?? []).map((u: any) => [u.id, u.name]));
    blocks.forEach(b => { if (b.blockType === "user") b.label = userMap.get(b.targetId) || "알 수 없음"; });
  }

  // 책 제목 조회
  const bookIds = blocks.filter(b => b.blockType === "book").map(b => b.targetId);
  if (bookIds.length > 0) {
    const { data: books } = await supabase.from("books").select("id, title, author").in("id", bookIds);
    const bookMap = new Map((books ?? []).map((b: any) => [b.id, `${b.title} · ${b.author}`]));
    blocks.forEach(b => { if (b.blockType === "book") b.label = bookMap.get(b.targetId) || "알 수 없음"; });
  }

  // 글 인용문 조회
  const lineIds = blocks.filter(b => b.blockType === "underline").map(b => b.targetId);
  if (lineIds.length > 0) {
    const { data: lines } = await supabase.from("underlines").select("id, quote").in("id", lineIds);
    const lineMap = new Map((lines ?? []).map((l: any) => [l.id, l.quote?.slice(0, 30) + (l.quote?.length > 30 ? "…" : "")]));
    blocks.forEach(b => { if (b.blockType === "underline") b.label = lineMap.get(b.targetId) || "알 수 없음"; });
  }

  return blocks;
}

export async function fetchFollowingIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  return data?.map((r: any) => r.following_id) ?? [];
}

export async function unblock(userId: string, blockType: string, targetId: string): Promise<boolean> {
  const { error } = await supabase.from("user_blocks")
    .delete()
    .eq("user_id", userId)
    .eq("block_type", blockType)
    .eq("target_id", targetId);
  if (!error) invalidateCache("feed");
  return !error;
}
