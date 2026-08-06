import { Platform } from "react-native";

export type DeviceContact = {
  id: string;
  name: string;
  phones: string[];
};

/** Contacts stub — expo-contacts omitted from this Vivo-safe APK. */
export async function requestContactsPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }
  return false;
}

export async function loadDeviceContacts(): Promise<DeviceContact[]> {
  return [];
}

export function collectContactPhones(contacts: DeviceContact[]): string[] {
  const phones = new Set<string>();
  for (const contact of contacts) {
    for (const phone of contact.phones) {
      phones.add(phone);
      const digits = phone.replace(/\D/g, "");
      if (digits) {
        phones.add(digits);
        phones.add(`+${digits}`);
        if (digits.length >= 10) {
          phones.add(digits.slice(-10));
        }
      }
    }
  }
  return [...phones];
}
