import { supabase } from "../supabase";

export async function fetchPublicWeaves() {
  const { data } = await supabase
    .from("weaves")
    .select("*, weave_blocks(id, block_type, underline_id, content, position, underlines(quote)), users!weaves_user_id_fkey(*)")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(30);

  if (!data) return [];

  return data.map((w: any) => {
    const blocks = (w.weave_blocks as any[]) ?? [];
    const sortedBlocks = [...blocks].sort((a: any, b: any) => a.position - b.position);

    // Find first quote from joined underlines, or first note content
    let firstQuote: string | null = null;
    const firstUlBlock = sortedBlocks.find((b: any) => b.block_type === "underline" && b.underlines);
    if (firstUlBlock?.underlines?.quote) {
      firstQuote = firstUlBlock.underlines.quote;
    }
    if (!firstQuote) {
      const firstNote = sortedBlocks.find((b: any) => b.block_type === "note" && b.content);
      if (firstNote) firstQuote = firstNote.content;
    }

    return {
      id: w.id as string,
      shortId: w.short_id as string,
      title: w.title as string,
      description: w.description as string | null,
      coverColor: w.cover_color as string,
      isPublic: true,
      blockCount: blocks.length,
      userName: (w.users as any)?.name ?? "",
      userHandle: (w.users as any)?.handle ?? "",
      userId: w.user_id as string,
      updatedAt: w.updated_at as string,
      firstQuote,
    };
  });
}

export async function fetchUserWeaves(userId: string) {
  const { data } = await supabase
    .from("weaves")
    .select("*, weave_blocks(id, block_type, content, position, underlines(quote)), users!weaves_user_id_fkey(handle)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((w: any) => {
    const blocks = (w.weave_blocks as any[]) ?? [];
    const sorted = [...blocks].sort((a: any, b: any) => a.position - b.position);
    let firstQuote: string | null = null;
    const ulBlock = sorted.find((b: any) => b.block_type === "underline" && b.underlines);
    if (ulBlock?.underlines?.quote) firstQuote = ulBlock.underlines.quote;
    if (!firstQuote) {
      const noteBlock = sorted.find((b: any) => b.block_type === "note" && b.content);
      if (noteBlock) firstQuote = noteBlock.content;
    }
    return {
      id: w.id as string,
      shortId: w.short_id as string,
      title: w.title as string,
      description: w.description as string | null,
      coverColor: w.cover_color as string,
      isPublic: w.is_public as boolean,
      userHandle: (w.users as any)?.handle ?? "",
      blockCount: blocks.length,
      createdAt: w.created_at as string,
      updatedAt: w.updated_at as string,
      firstQuote,
    };
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchWeaveDetail(weaveId: string) {
  const col = UUID_RE.test(weaveId) ? "id" : "short_id";
  const { data } = await supabase
    .from("weaves")
    .select("*, users!weaves_user_id_fkey(*)")
    .eq(col, weaveId)
    .single();

  if (!data) return null;
  return {
    id: data.id as string,
    shortId: (data as any).short_id as string,
    userId: data.user_id as string,
    title: data.title as string,
    description: data.description as string | null,
    coverColor: data.cover_color as string,
    isPublic: data.is_public as boolean,
    userName: ((data as any).users as any)?.name ?? "?",
    userHandle: ((data as any).users as any)?.handle ?? "",
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function createWeave(userId: string, title: string, coverColor: string, description?: string, isPublic = false) {
  const { data, error } = await supabase
    .from("weaves")
    .insert({ user_id: userId, title, cover_color: coverColor, description: description || null, is_public: isPublic })
    .select()
    .single();
  if (error) return { error: error.message };
  return { data };
}

export async function updateWeave(weaveId: string, updates: { title?: string; description?: string; cover_color?: string; is_public?: boolean }) {
  const { error } = await supabase
    .from("weaves")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", weaveId);
  return !error;
}

export async function deleteWeave(weaveId: string) {
  const { error } = await supabase.from("weaves").delete().eq("id", weaveId);
  return !error;
}

export async function fetchWeaveBlocks(weaveId: string) {
  const { data } = await supabase
    .from("weave_blocks")
    .select("*, underlines(*, users!underlines_user_id_fkey(*), books(*))")
    .eq("weave_id", weaveId)
    .order("position", { ascending: true });

  return (data ?? []).map((b: any) => ({
    id: b.id as string,
    type: b.block_type as "underline" | "note" | "divider",
    position: b.position as number,
    content: b.content as string | null,
    underline: b.underlines ? {
      id: (b.underlines as any).id as string,
      quote: (b.underlines as any).quote as string,
      page: (b.underlines as any).page as number,
      feeling: (b.underlines as any).feeling as string | null,
      userName: ((b.underlines as any).users as any)?.name ?? "?",
      bookTitle: ((b.underlines as any).books as any)?.title ?? "?",
      bookAuthor: ((b.underlines as any).books as any)?.author ?? "?",
    } : null,
  }));
}

export async function addWeaveBlock(weaveId: string, blockType: string, position: number, lineId?: string, content?: string) {
  const { data, error } = await supabase
    .from("weave_blocks")
    .insert({
      weave_id: weaveId,
      block_type: blockType,
      position,
      underline_id: lineId || null,
      content: content || null,
    })
    .select()
    .single();
  if (error) return null;
  await supabase.from("weaves").update({ updated_at: new Date().toISOString() }).eq("id", weaveId);
  return data;
}

export async function updateBlockPositions(blocks: { id: string; position: number }[]) {
  for (const b of blocks) {
    await supabase.from("weave_blocks").update({ position: b.position }).eq("id", b.id);
  }
}

export async function updateWeaveBlock(blockId: string, content: string) {
  const { error } = await supabase.from("weave_blocks").update({ content }).eq("id", blockId);
  return !error;
}

export async function deleteWeaveBlock(blockId: string) {
  const { error } = await supabase.from("weave_blocks").delete().eq("id", blockId);
  return !error;
}

export async function fetchUserLinesForWeave(userId: string) {
  const { data } = await supabase
    .from("underlines")
    .select("*, books(title, author)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((u: any) => ({
    id: u.id as string,
    quote: u.quote as string,
    page: u.page as number,
    bookTitle: (u.books as any)?.title ?? "?",
    bookAuthor: (u.books as any)?.author ?? "?",
  }));
}

/* ─── 노트 저장/해제 ─── */

export async function toggleWeaveSave(userId: string, weaveId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from("weave_saves")
    .select("id")
    .eq("user_id", userId)
    .eq("weave_id", weaveId)
    .maybeSingle();

  if (existing) {
    await supabase.from("weave_saves").delete().eq("id", existing.id);
    return false; // unsaved
  } else {
    await supabase.from("weave_saves").insert({ user_id: userId, weave_id: weaveId });
    return true; // saved
  }
}

export async function checkWeaveSaved(userId: string, weaveId: string): Promise<boolean> {
  const { count } = await supabase
    .from("weave_saves")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("weave_id", weaveId);
  return (count ?? 0) > 0;
}

export async function fetchSavedWeaves(userId: string) {
  const { data } = await supabase
    .from("weave_saves")
    .select("weave_id, weaves(*, weave_blocks(id, block_type, content, position, underlines(quote)), users!weaves_user_id_fkey(name, handle))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data
    .filter((s: any) => s.weaves)
    .map((s: any) => {
      const w = s.weaves;
      const blocks = (w.weave_blocks as any[]) ?? [];
      const sorted = [...blocks].sort((a: any, b: any) => a.position - b.position);
      let firstQuote: string | null = null;
      const ulBlock = sorted.find((b: any) => b.block_type === "underline" && b.underlines);
      if (ulBlock?.underlines?.quote) firstQuote = ulBlock.underlines.quote;
      if (!firstQuote) {
        const noteBlock = sorted.find((b: any) => b.block_type === "note" && b.content);
        if (noteBlock) firstQuote = noteBlock.content;
      }

      return {
        id: w.id as string,
        shortId: w.short_id as string,
        title: w.title as string,
        coverColor: w.cover_color as string,
        blockCount: blocks.length,
        userName: (w.users as any)?.name ?? "",
        userHandle: (w.users as any)?.handle ?? "",
        firstQuote,
      };
    });
}
