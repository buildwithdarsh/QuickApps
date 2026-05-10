// Simple event bus for cross-component communication

export function emitWalletUpdate() {
  window.dispatchEvent(new CustomEvent("wallet:updated"));
}

export function onWalletUpdate(callback: () => void) {
  window.addEventListener("wallet:updated", callback);
  return () => window.removeEventListener("wallet:updated", callback);
}
