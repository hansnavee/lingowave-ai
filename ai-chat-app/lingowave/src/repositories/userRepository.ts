import { supabase } from "../lib/supabase";
import type { ChatUser } from "../types/models";

export async function getUsers(): Promise<ChatUser[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentId = session?.user?.id;

  let query = supabase.from("profiles").select("id, name, phone").order("name");

  if (currentId) {
    query = query.neq("id", currentId);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.warn("getUsers failed:", error?.message);
    return [];
  }

  return data.map((profile) => ({
    id: profile.id,
    name: profile.name,
    status: profile.phone || "Available",
    phone: profile.phone || undefined,
  }));
}
