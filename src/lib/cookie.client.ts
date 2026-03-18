// Client-side cookie utilities.
// These functions manage cookies in the browser only.
// Server actions handle cookie updates on the server side.

export function setClientCookie(key: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${key}=${value}; expires=${expires}; path=/`;
}

export function getClientCookie(key: string) {
  const row = document.cookie.split("; ").find((r) => r.startsWith(`${key}=`));
  if (!row) return undefined;
  return row.split("=").slice(1).join("=");
}

export function deleteClientCookie(key: string) {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}
