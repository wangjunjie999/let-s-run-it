/**
 * Offline Cache Service
 * Provides IndexedDB-based caching for offline support
 */
import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'vision-config-cache';
const DB_VERSION = 1;

interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number | null;
}

interface PendingUploadEntry {
  id: string;
  file: ArrayBuffer;
  fileName: string;
  fileType: string;
  assetInfo: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
}

interface DraftEntry<T = unknown> {
  key: string;
  data: T;
  updatedAt: number;
}

class OfflineCacheService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB 初始化失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('pendingUploads')) {
          const uploadStore = db.createObjectStore('pendingUploads', { keyPath: 'id' });
          uploadStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('drafts')) {
          const draftsStore = db.createObjectStore('drafts', { keyPath: 'key' });
          draftsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async ensureDb(): Promise<IDBDatabase> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    return this.db;
  }

  // ==================== Cache Operations ====================

  async set<T>(key: string, data: T, ttlMs?: number): Promise<void> {
    const db = await this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cache', 'readwrite');
      const store = transaction.objectStore('cache');

      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: ttlMs ? Date.now() + ttlMs : null,
      };

      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cache', 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
          this.delete(key).catch(console.error);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cache', 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpired(): Promise<number> {
    const db = await this.ensureDb();
    const now = Date.now();
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cache', 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const entry = cursor.value as CacheEntry;
          if (entry.expiresAt && entry.expiresAt < now) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Pending Uploads ====================

  async addPendingUpload(
    file: File,
    assetInfo: Record<string, unknown>,
    metadata: Record<string, unknown> = {}
  ): Promise<string> {
    const db = await this.ensureDb();
    const id = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const arrayBuffer = await file.arrayBuffer();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('pendingUploads', 'readwrite');
      const store = transaction.objectStore('pendingUploads');

      const entry: PendingUploadEntry = {
        id,
        file: arrayBuffer,
        fileName: file.name,
        fileType: file.type,
        assetInfo,
        metadata,
        createdAt: Date.now(),
        retryCount: 0,
      };

      const request = store.add(entry);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingUploads(): Promise<Array<{
    id: string;
    file: File;
    assetInfo: Record<string, unknown>;
    metadata: Record<string, unknown>;
    createdAt: number;
    retryCount: number;
  }>> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('pendingUploads', 'readonly');
      const store = transaction.objectStore('pendingUploads');
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as PendingUploadEntry[];
        const uploads = entries.map(entry => ({
          id: entry.id,
          file: new File([entry.file], entry.fileName, { type: entry.fileType }),
          assetInfo: entry.assetInfo,
          metadata: entry.metadata,
          createdAt: entry.createdAt,
          retryCount: entry.retryCount,
        }));
        resolve(uploads);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async removePendingUpload(id: string): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('pendingUploads', 'readwrite');
      const store = transaction.objectStore('pendingUploads');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async incrementRetryCount(id: string): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('pendingUploads', 'readwrite');
      const store = transaction.objectStore('pendingUploads');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const entry = getRequest.result as PendingUploadEntry | undefined;
        if (entry) {
          entry.retryCount++;
          store.put(entry);
        }
        resolve();
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ==================== Draft Management ====================

  async saveDraft<T>(key: string, data: T): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', 'readwrite');
      const store = transaction.objectStore('drafts');

      const entry: DraftEntry<T> = {
        key,
        data,
        updatedAt: Date.now(),
      };

      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDraft<T>(key: string): Promise<T | null> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', 'readonly');
      const store = transaction.objectStore('drafts');
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as DraftEntry<T> | undefined;
        resolve(entry ? entry.data : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async deleteDraft(key: string): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDrafts(): Promise<Array<DraftEntry>> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', 'readonly');
      const store = transaction.objectStore('drafts');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Utilities ====================

  async clearAll(): Promise<void> {
    const db = await this.ensureDb();
    const storeNames = ['cache', 'pendingUploads', 'drafts'];

    await Promise.all(storeNames.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }));
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { used: 0, quota: 0 };
  }
}

// Singleton instance
export const offlineCache = new OfflineCacheService();

// Initialize on module load
offlineCache.init().catch(console.error);

// Hook for using offline cache
export function useOfflineCache<T>(key: string, initialValue: T | null = null) {
  const [data, setData] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offlineCache.get<T>(key)
      .then(cached => {
        if (cached !== null) {
          setData(cached);
        }
      })
      .finally(() => setLoading(false));
  }, [key]);

  const setValue = useCallback(async (newData: T, ttlMs?: number) => {
    setData(newData);
    await offlineCache.set(key, newData, ttlMs);
  }, [key]);

  const remove = useCallback(async () => {
    setData(null);
    await offlineCache.delete(key);
  }, [key]);

  return { data, loading, setValue, remove };
}

// Hook for pending uploads sync
export function usePendingUploads() {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const uploads = await offlineCache.getPendingUploads();
    setPendingCount(uploads.length);
    return uploads;
  }, []);

  useEffect(() => {
    refresh();

    // Refresh when online
    const handleOnline = () => refresh();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refresh]);

  return { pendingCount, syncing, setSyncing, refresh };
}

// Export types
export type { CacheEntry, PendingUploadEntry, DraftEntry };
