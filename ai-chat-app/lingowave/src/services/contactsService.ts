import { Platform } from "react-native";
import * as Contacts from "expo-contacts";

import { normalizePhone } from "../utils/validation";

export type DeviceContact = {
  id: string;
  name: string;
  phones: string[];
};

export async function requestContactsPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const current = await Contacts.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const next = await Contacts.requestPermissionsAsync();
  return next.granted;
}

export async function loadDeviceContacts(): Promise<DeviceContact[]> {
  const granted = await requestContactsPermission();
  if (!granted) {
    return [];
  }

  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    pageSize: 2000,
    sort: Contacts.SortTypes.FirstName,
  });

  return (data ?? [])
    .map((contact) => {
      const phones = (contact.phoneNumbers ?? [])
        .map((entry) => normalizePhone(entry.number ?? ""))
        .filter((phone) => phone.length >= 10);

      if (phones.length === 0) {
        return null;
      }

      return {
        id: contact.id,
        name:
          contact.name?.trim() ||
          [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
          phones[0],
        phones: [...new Set(phones)],
      } satisfies DeviceContact;
    })
    .filter((contact): contact is DeviceContact => Boolean(contact));
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
