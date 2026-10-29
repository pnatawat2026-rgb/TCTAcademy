// App Version & Cache Busting Utility
// Solves corporate browser and PC aggressive caching of PWAs and stale assets

export const APP_BUILD_VERSION = '2026.10.22-v3-realtime';
export const APP_BUILD_LABEL = 'TCT E-Training v3 (ความปลอดภัย + โลเคชั่น + ทำต่อเนื่อง)';

/**
 * Completely purge browser caches, unregister outdated service workers,
 * and force a fresh fetch from the server.
 */
export async function forceHardRefreshAndPurgeCache(): Promise<void> {
  console.log('[AppUpdate] Forcing hard refresh and purging all caches...');
  try {
    // 1. Clear CacheStorage
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
      console.log('[AppUpdate] Cleared CacheStorage:', cacheNames);
    }

    // 2. Unregister all service workers
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
      console.log('[AppUpdate] Unregistered service workers');
    }

    // 3. Clear transient session/sessionStorage cache keys (keep user auth if desired)
    try {
      sessionStorage.removeItem('tct_sw_updated');
    } catch (e) {
      // ignore
    }
  } catch (err) {
    console.warn('[AppUpdate] Cache purge notice:', err);
  }

  // 4. Force hard reload with timestamp query to defeat aggressive browser disk caches
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.set('_v', Date.now().toString());
  window.location.href = cleanUrl.toString();
}

/**
 * Check if the server has a newer version and notify if outdated
 */
export async function checkForAppUpdates(): Promise<{ hasUpdate: boolean; serverVersion?: string }> {
  try {
    const res = await fetch(`/api/version?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return { hasUpdate: false };
    const data = await res.json();
    if (data && data.version && data.version !== APP_BUILD_VERSION) {
      return { hasUpdate: true, serverVersion: data.version };
    }
  } catch (e) {
    // offline or backend not ready
  }
  return { hasUpdate: false };
}
