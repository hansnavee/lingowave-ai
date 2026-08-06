const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const shims = {
  "@react-navigation/native": path.resolve(
    __dirname,
    "src/navigation/shims/react-navigation-native.ts"
  ),
  "@react-navigation/native-stack": path.resolve(
    __dirname,
    "src/navigation/shims/react-navigation-native-stack.ts"
  ),
  "@react-navigation/bottom-tabs": path.resolve(
    __dirname,
    "src/navigation/shims/react-navigation-bottom-tabs.ts"
  ),
  "@expo/vector-icons": path.resolve(
    __dirname,
    "src/navigation/shims/vector-icons.ts"
  ),
};

const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (shims[moduleName]) {
    return {
      filePath: shims[moduleName],
      type: "sourceFile",
    };
  }

  if (typeof upstreamResolveRequest === "function") {
    return upstreamResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
