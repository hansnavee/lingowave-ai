import { registerRootComponent } from "expo";
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  // LiveKit WebRTC globals (native/dev builds only)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@livekit/react-native").registerGlobals();
}

import App from "./App";

registerRootComponent(App);
