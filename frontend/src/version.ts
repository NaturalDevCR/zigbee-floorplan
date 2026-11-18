/** Hash of this bundle as served by the integration (`?v=` on the module URL); null in dev. */
export const LOADED_BUNDLE_HASH: string | null = (() => {
  try {
    return new URL(import.meta.url).searchParams.get("v");
  } catch {
    return null;
  }
})();

export function isStaleBundle(serverHash: string | null | undefined): boolean {
  return !!serverHash && !!LOADED_BUNDLE_HASH && serverHash !== LOADED_BUNDLE_HASH;
}
