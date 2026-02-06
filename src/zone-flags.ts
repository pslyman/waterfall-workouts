/**
 * Prevents Angular change detection from
 * running with certain Web Component callbacks
 */
export {};

declare global {
  interface Window {
    __Zone_disable_customElements?: boolean;
  }
}

window.__Zone_disable_customElements = true;
