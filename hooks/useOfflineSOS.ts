
import { useEffect, useCallback, useRef } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { GeoLocation, SOSAlert } from '../types';

const DB_NAME = 'ResilienceOS_Offline';
const STORE_NAME = 'pending_sos';
const BREADCRUMB_STORE = 'breadcrumbs';

export const useOfflineSOS = (onSync: (alerts: SOSAlert[]) => void) => {
  const dbRef = useRef<IDBPDatabase | null>(null);

  useEffect(() => {
    const initDB = async () => {
      dbRef.current = await openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(BREADCRUMB_STORE)) {
            db.createObjectStore(BREADCRUMB_STORE, { keyPath: 'timestamp' });
          }
        },
      });
    };
    initDB();
  }, []);

  const saveSOSOffline = useCallback(async (alert: SOSAlert) => {
    if (!dbRef.current) return;
    await dbRef.current.put(STORE_NAME, alert);
  }, []);

  const recordBreadcrumb = useCallback(async (location: GeoLocation) => {
    if (!dbRef.current) return;
    await dbRef.current.put(BREADCRUMB_STORE, {
      location,
      timestamp: Date.now()
    });
  }, []);

  const syncPendingAlerts = useCallback(async () => {
    if (!dbRef.current || !navigator.onLine) return;
    const tx = dbRef.current.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const alerts = await store.getAll();
    if (alerts.length > 0) {
      onSync(alerts);
      await store.clear();
    }
    await tx.done;
  }, [onSync]);

  // Sync when coming back online
  useEffect(() => {
    window.addEventListener('online', syncPendingAlerts);
    return () => window.removeEventListener('online', syncPendingAlerts);
  }, [syncPendingAlerts]);

  // Module A: Breadcrumb polling every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        recordBreadcrumb({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, null, { enableHighAccuracy: false });
    }, 60000);
    return () => clearInterval(interval);
  }, [recordBreadcrumb]);

  return { saveSOSOffline, syncPendingAlerts };
};
