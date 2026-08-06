import { supabase } from "../lib/supabase";

function extensionFromUri(uri: string, fallback = "bin"): string {
  const clean = uri.split("?")[0] ?? uri;
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? fallback;
}

function mimeFromExt(ext: string): string {
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "m4a":
      return "audio/mp4";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  return response.arrayBuffer();
}

export async function uploadAvatar(localUri: string): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in.");
  }

  const ext = extensionFromUri(localUri, "jpg");
  const path = `${user.id}/avatar.${ext}`;
  const body = await uriToArrayBuffer(localUri);

  const { error } = await supabase.storage.from("avatars").upload(path, body, {
    upsert: true,
    contentType: mimeFromExt(ext),
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  // Cache-bust so updated photos refresh immediately
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function uploadChatFile(params: {
  localUri: string;
  chatId: string;
  fileName?: string;
}): Promise<{ url: string; fileName: string; fileSize?: number }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in.");
  }

  const fileName =
    params.fileName ??
    `file-${Date.now()}.${extensionFromUri(params.localUri)}`;
  const safeName = fileName.replace(/[^\w.\-]+/g, "_");
  const path = `${user.id}/${params.chatId}/${Date.now()}-${safeName}`;
  const body = await uriToArrayBuffer(params.localUri);
  const ext = extensionFromUri(safeName, extensionFromUri(params.localUri));

  const { error } = await supabase.storage
    .from("chat-files")
    .upload(path, body, {
      upsert: false,
      contentType: mimeFromExt(ext),
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("chat-files").getPublicUrl(path);

  return {
    url: data.publicUrl,
    fileName: safeName,
    fileSize: body.byteLength,
  };
}
