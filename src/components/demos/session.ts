"use client";
import { useEffect, useRef, useState } from "react";

// sessionStorage is scoped to this browser tab and never sent to a server.
export function useDemoSession<T>(key: string, seed: () => T) {
  const [data, setData] = useState<T | null>(null);
  const current = useRef<T | null>(null);
  const [storageWarning, setStorageWarning] = useState("");
  useEffect(() => {
    let initial = seed();
    try { const stored = sessionStorage.getItem(key); if (stored) initial = JSON.parse(stored) as T; }
    catch { /* Corrupt or blocked storage falls back to usable sample data. */ }
    current.current = initial;
    // Hydrate browser-only session data after the identical server/client shell.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(initial);
  }, [key, seed]);
  function update(value: T | ((previous: T) => T)) {
    const next = typeof value === "function" ? (value as (previous: T) => T)(current.current ?? seed()) : value;
    current.current = next;
    setData(next);
    try { sessionStorage.setItem(key, JSON.stringify(next)); setStorageWarning(""); }
    catch { setStorageWarning("Browser session storage is unavailable or full. You can still try the demo, but changes may disappear when you reload. Reset to clear this demo’s saved data."); }
  }
  function reset() {
    try { sessionStorage.removeItem(key); } catch { /* In-memory mode still works. */ }
    update(seed());
  }
  return { data, update, reset, storageWarning };
}
