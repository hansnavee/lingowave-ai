const memory = new Map<string, string>();

/** Pure JS storage — avoids AsyncStorage / SecureStore native modules on Vivo. */
export const memoryStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return memory.has(key) ? (memory.get(key) as string) : null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memory.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    memory.delete(key);
  },
};
