import { SITE_STATE_ID, SUPABASE_BUCKET, hasSupabaseConfig, supabase } from "./supabase";

export type SharedCmsPayload = Record<string, unknown>;

type UploadResult = {
  publicUrl: string;
  path: string;
  contentType: string;
  size: number;
};

export async function fetchRemoteCmsState<T>() {
  const client = supabase;
  if (!hasSupabaseConfig || !client) return null;

  const { data, error } = await client
    .from("site_state")
    .select("data")
    .eq("id", SITE_STATE_ID)
    .maybeSingle();

  if (error) {
    console.error("Erreur Supabase fetchRemoteCmsState:", error.message);
    return null;
  }

  return (data?.data as T | null) ?? null;
}

export async function saveRemoteCmsState<T extends SharedCmsPayload>(payload: T) {
  const client = supabase;
  if (!hasSupabaseConfig || !client) return { ok: false as const, remote: false as const };

  const { error } = await client.from("site_state").upsert(
    {
      id: SITE_STATE_ID,
      data: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("Erreur Supabase saveRemoteCmsState:", error.message);
    return { ok: false as const, remote: true as const, error: error.message };
  }

  return { ok: true as const, remote: true as const };
}

export function subscribeToRemoteCms(onChange: () => void) {
  const client = supabase;
  if (!hasSupabaseConfig || !client) return () => undefined;

  const channel = client
    .channel("site-state-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "site_state",
        filter: `id=eq.${SITE_STATE_ID}`,
      },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export async function uploadMediaToSupabase(file: File, folder = "gallery"):
  Promise<UploadResult | null> {
  const client = supabase;
  if (!hasSupabaseConfig || !client) return null;

  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${Date.now()}-${sanitized}`;

  const { error: uploadError } = await client.storage.from(SUPABASE_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (uploadError) {
    console.error("Erreur Supabase uploadMediaToSupabase:", uploadError.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = client.storage.from(SUPABASE_BUCKET).getPublicUrl(path);

  return {
    publicUrl,
    path,
    contentType: file.type || "application/octet-stream",
    size: file.size || 0,
  };
}
