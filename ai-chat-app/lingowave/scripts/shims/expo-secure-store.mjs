/** Minimal expo-secure-store shim — forces memory fallback in session/subscription storage. */
export async function isAvailableAsync() {
  return false;
}

export async function getItemAsync() {
  return null;
}

export async function setItemAsync() {}

export async function deleteItemAsync() {}

export default {
  isAvailableAsync,
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
};
