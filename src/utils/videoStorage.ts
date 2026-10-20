/**
 * IndexedDB Video File Storage Utility
 * Allows users and admins to upload and store local video files (MP4, WebM, MOV)
 * directly in the browser without size limits of localStorage.
 */

const DB_NAME = 'tct_video_storage_db';
const DB_VERSION = 1;
const STORE_NAME = 'module_videos';

interface StoredVideoRecord {
  id: string; // `${courseId}_${moduleId}`
  courseId: string;
  moduleId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  blob: Blob;
  updatedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db: IDBDatabase = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an uploaded video file for a specific course module
 */
export async function saveLocalVideoFile(
  courseId: string,
  moduleId: number,
  file: File | Blob,
  fileName: string = 'video.mp4'
): Promise<string> {
  const db = await openDB();
  const id = `${courseId}_${moduleId}`;
  const record: StoredVideoRecord = {
    id,
    courseId,
    moduleId,
    fileName,
    fileSize: file.size,
    mimeType: file.type || 'video/mp4',
    blob: file,
    updatedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => {
      const objectUrl = URL.createObjectURL(file);
      // Dispatch custom event to notify listeners
      window.dispatchEvent(new CustomEvent('tct_video_file_updated', { detail: { courseId, moduleId } }));
      resolve(objectUrl);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve a stored video record and generate an Object URL
 */
export async function getLocalVideoFile(
  courseId: string,
  moduleId: number
): Promise<{ objectUrl: string; fileName: string; fileSize: number; updatedAt: string } | null> {
  try {
    const db = await openDB();
    const id = `${courseId}_${moduleId}`;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const res: StoredVideoRecord | undefined = req.result;
        if (res && res.blob) {
          const objectUrl = URL.createObjectURL(res.blob);
          resolve({
            objectUrl,
            fileName: res.fileName,
            fileSize: res.fileSize,
            updatedAt: res.updatedAt
          });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

/**
 * Delete an uploaded video file
 */
export async function deleteLocalVideoFile(courseId: string, moduleId: number): Promise<boolean> {
  try {
    const db = await openDB();
    const id = `${courseId}_${moduleId}`;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => {
        window.dispatchEvent(new CustomEvent('tct_video_file_updated', { detail: { courseId, moduleId } }));
        resolve(true);
      };
      req.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}
