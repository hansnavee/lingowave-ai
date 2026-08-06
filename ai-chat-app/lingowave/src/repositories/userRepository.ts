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

/** Pull device contacts and return profiles that already joined LingoWave. */
export async function getJoinedContacts(): Promise<{
  users: ChatUser[];
  permissionDenied: boolean;
}> {
  const { requestContactsPermission, loadDeviceContacts, collectContactPhones } =
    await import("../services/contactsService");

  const granted = await requestContactsPermission();
  if (!granted) {
    return { users: [], permissionDenied: true };
  }

  const contacts = await loadDeviceContacts();
  const phones = collectContactPhones(contacts);
  if (phones.length === 0) {
    return { users: [], permissionDenied: false };
  }

  const { data, error } = await supabase.rpc("find_profiles_by_phones", {
    p_phones: phones,
  });

  if (error || !data) {
    console.warn("getJoinedContacts failed:", error?.message);
    return { users: [], permissionDenied: false };
  }

  const contactNameByLast10 = new Map<string, string>();
  for (const contact of contacts) {
    for (const phone of contact.phones) {
      const last10 = phone.replace(/\D/g, "").slice(-10);
      if (last10) {
        contactNameByLast10.set(last10, contact.name);
      }
    }
  }

  const users: ChatUser[] = data.map(
    (profile: { id: string; name: string; phone: string }) => {
      const last10 = profile.phone.replace(/\D/g, "").slice(-10);
      const contactName = contactNameByLast10.get(last10);
      return {
        id: profile.id,
        name: contactName || profile.name,
        status: "On LingoWave",
        phone: profile.phone || undefined,
      };
    }
  );

  return { users, permissionDenied: false };
}
