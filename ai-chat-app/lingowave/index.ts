import { registerRootComponent } from "expo";

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
