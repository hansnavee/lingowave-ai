/** Minimal react-native shim for Node MVP smoke tests. */
export const Platform = {
  OS: "ios",
  select: (spec) => (spec && (spec.ios ?? spec.default)),
};

export default { Platform };
