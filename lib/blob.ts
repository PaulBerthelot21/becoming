/** True for Vercel Blob object URLs (public or private hosts). */
export function isVercelBlobUrl(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    return (
      protocol === "https:" &&
      (hostname.endsWith(".blob.vercel-storage.com") || hostname === "blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

/** Same-origin proxy so private Blob URLs can be shown in <img>. */
export function mealImageSrc(blobUrl: string): string {
  return `/api/blob/file?url=${encodeURIComponent(blobUrl)}`;
}

/** Path inside the store, e.g. meals/<userId>/…. */
export function blobPathnameFromUrl(blobUrl: string): string | null {
  try {
    const { pathname } = new URL(blobUrl);
    const decoded = decodeURIComponent(pathname.replace(/^\/+/, ""));
    return decoded || null;
  } catch {
    return null;
  }
}

export function mealBlobBelongsToUser(blobUrl: string, userId: string): boolean {
  const pathname = blobPathnameFromUrl(blobUrl);
  return Boolean(pathname?.startsWith(`meals/${userId}/`));
}
