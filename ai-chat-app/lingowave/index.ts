import { registerRootComponent } from "expo";

/**
 * Hermes may lack DOMException; polyfill before any app/LiveKit modules load.
 * LiveKit registerGlobals is deferred to call screens (see livekitInit.ts).
 */
const g = globalThis as typeof globalThis & {
  DOMException?: new (message?: string, name?: string) => Error;
};
if (typeof g.DOMException === "undefined") {
  class DOMExceptionPolyfill extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? "DOMException";
    }
  }
  g.DOMException = DOMExceptionPolyfill as typeof g.DOMException;
}

import App from "./App";

registerRootComponent(App);
