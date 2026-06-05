// Polyfill descriptor wrapper to prevent browser sandbox iframe write-restrictions on window.fetch
try {
  let activeFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    get() {
      return activeFetch;
    },
    set(v) {
      activeFetch = v;
    }
  });
  if (typeof globalThis !== 'undefined' && globalThis !== window) {
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      enumerable: true,
      get() {
        return activeFetch;
      },
      set(v) {
        activeFetch = v;
      }
    });
  }
} catch (e) {
  console.warn("Could not patch window.fetch setter wrapper:", e);
}

export {};
