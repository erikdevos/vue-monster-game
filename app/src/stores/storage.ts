/** sessionStorage access that never throws (private mode, blocked storage, SSR/tests). */
export function readSession(key: string): unknown {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

export function writeSession(key: string, value: unknown): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore: persistence is a convenience, the game works without it.
  }
}

export function removeSession(key: string): void {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // Ignore.
  }
}
