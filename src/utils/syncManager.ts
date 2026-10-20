import { UserProfile, TraineeRecord, ActivityNotification } from '../types';
import { getStoredTrainees, saveStoredTrainees, saveUserPersistentProgress, getDeletedTraineeIds } from '../data/traineeData';

/**
 * Synchronizes trainee progress with the centralized backend server.
 * This guarantees real-time visibility across all devices (Mobile / PC / Tablet).
 */
export async function syncUserToServer(
  user: UserProfile,
  activityType?: 'login' | 'pretest' | 'module' | 'game' | 'posttest' | 'evaluation' | 'cert_issued',
  detail?: string
): Promise<TraineeRecord | null> {
  if (!user || !user.empId) return null;

  // Always save locally first as instant backup
  saveUserPersistentProgress(user);

  try {
    const response = await fetch('/api/trainees/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
      body: JSON.stringify({
        user,
        activityType,
        detail
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.trainee) {
        // Also update local cached list
        const localList = getStoredTrainees();
        const cleanId = user.empId.trim().toUpperCase();
        const idx = localList.findIndex(t => t.empId.trim().toUpperCase() === cleanId);
        if (idx >= 0) {
          localList[idx] = { ...localList[idx], ...data.trainee };
        } else {
          localList.unshift(data.trainee);
        }
        saveStoredTrainees(localList);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('tct_trainee_synced', { detail: data.trainee }));
        return data.trainee;
      }
    }
  } catch (e) {
    console.debug('Server sync failed, retained in local storage', e);
  }

  return null;
}

/**
 * Updates trainee personal profile on the server.
 */
export async function syncServerTraineeProfile(data: {
  empId: string;
  prefix?: string;
  fullName?: string;
  department?: string;
  position?: string;
  notes?: string;
}): Promise<boolean> {
  if (!data || !data.empId) return false;
  try {
    const cleanId = data.empId.trim().toUpperCase();
    const res = await fetch(`/api/trainees/${encodeURIComponent(cleanId)}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) {
    console.debug('Failed to sync trainee profile to server', e);
    return false;
  }
}

/**
 * Fetches the latest centralized trainee list from the server and deeply merges with local storage.
 */
export async function fetchServerTrainees(): Promise<{
  trainees: TraineeRecord[];
  totalCount: number;
  passedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  lastUpdated: string;
} | null> {
  try {
    const response = await fetch('/api/trainees');
    if (response.ok) {
      const data = await response.json();
      if (data && data.trainees) {
        const deletedIds = new Set(getDeletedTraineeIds().map(id => id.toUpperCase()));
        const serverTrainees = (data.trainees as TraineeRecord[]).filter(
          t => !deletedIds.has(t.empId.trim().toUpperCase())
        );

        // Merge intelligently with locally cached list so no records or scores are dropped
        const localList = getStoredTrainees();
        const map = new Map<string, TraineeRecord>();
        for (const t of localList) {
          map.set(t.empId.trim().toUpperCase(), t);
        }
        for (const st of serverTrainees) {
          const key = st.empId.trim().toUpperCase();
          const existing = map.get(key);
          if (existing) {
            const mergedCp: Record<string, any> = {};
            const allCourseKeys = Array.from(new Set([
              ...Object.keys(st.coursesProgress || {}),
              ...Object.keys(existing.coursesProgress || {})
            ]));

            for (const cKey of allCourseKeys) {
              const stCp: any = (st.coursesProgress as any)?.[cKey] || {};
              const exCp: any = (existing.coursesProgress as any)?.[cKey] || {};
              mergedCp[cKey] = {
                ...stCp,
                ...exCp,
                preTestScore: exCp.preTestScore ?? stCp.preTestScore ?? null,
                postTestScore: exCp.postTestScore ?? stCp.postTestScore ?? null,
                postTestAttempts: Math.max(exCp.postTestAttempts || 0, stCp.postTestAttempts || 0),
                miniGameScore: Math.max(exCp.miniGameScore || 0, stCp.miniGameScore || 0),
                completedModules: Array.from(new Set([...(exCp.completedModules || []), ...(stCp.completedModules || [])])),
                evaluationSubmitted: Boolean(exCp.evaluationSubmitted || stCp.evaluationSubmitted),
                certificateId: exCp.certificateId || stCp.certificateId,
                certificateDate: exCp.certificateDate || stCp.certificateDate
              };
            }

            map.set(key, {
              ...st,
              ...existing, // Local edits to name, department, position take precedence so they never revert
              coursesProgress: mergedCp,
              preTestScore: existing.preTestScore ?? st.preTestScore,
              postTestScore: existing.postTestScore ?? st.postTestScore,
              postTestAttempts: Math.max(existing.postTestAttempts || 0, st.postTestAttempts || 0),
              miniGameScore: Math.max(existing.miniGameScore || 0, st.miniGameScore || 0),
              certificateId: existing.certificateId || st.certificateId,
              certificateDate: existing.certificateDate || st.certificateDate,
              evaluationSubmitted: Boolean(existing.evaluationSubmitted || st.evaluationSubmitted)
            });
          } else {
            map.set(key, st);
          }
        }

        const mergedTrainees = Array.from(map.values()).filter(t => {
          if (!t || !t.empId) return false;
          const cleanId = t.empId.trim().toUpperCase();
          return !deletedIds.has(cleanId);
        });

        saveStoredTrainees(mergedTrainees);
        return {
          ...data,
          trainees: mergedTrainees,
          totalCount: mergedTrainees.length,
          passedCount: mergedTrainees.filter(t => t.status === 'passed').length,
          inProgressCount: mergedTrainees.filter(t => t.status === 'in_progress').length,
          notStartedCount: mergedTrainees.filter(t => t.status === 'not_started').length,
        };
      }
    }
  } catch (e) {
    console.debug('Failed to fetch trainees from server', e);
  }
  return null;
}

/**
 * Deletes a trainee on the server.
 */
export async function deleteServerTrainee(empId: string): Promise<boolean> {
  if (!empId) return false;
  try {
    const cleanId = empId.trim().toUpperCase();
    const res = await fetch(`/api/trainees/${encodeURIComponent(cleanId)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    console.debug('Failed to delete trainee on server', e);
    return false;
  }
}

/**
 * Fetches a single trainee's live record from the server.
 */
export async function fetchSingleServerTrainee(empId: string): Promise<TraineeRecord | null> {
  if (!empId) return null;
  try {
    const cleanId = empId.trim().toUpperCase();
    const response = await fetch(`/api/trainees/${encodeURIComponent(cleanId)}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.trainee) {
        // Also update local cached list and persistent user progress
        const localList = getStoredTrainees();
        const idx = localList.findIndex(t => t.empId.trim().toUpperCase() === cleanId);
        if (idx >= 0) {
          localList[idx] = { ...localList[idx], ...data.trainee };
        } else {
          localList.unshift(data.trainee);
        }
        saveStoredTrainees(localList);
        return data.trainee;
      }
    }
  } catch (e) {
    console.debug('Failed to fetch single trainee from server', e);
  }
  return null;
}

/**
 * Fetches real-time live activity notifications stream.
 */
export async function fetchActivityStream(): Promise<ActivityNotification[]> {
  try {
    const response = await fetch('/api/activity-stream');
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.activities)) {
        return data.activities;
      }
    }
  } catch (e) {
    console.debug('Failed to fetch activity stream', e);
  }
  return [];
}

/**
 * Sends a custom real-time notification to the server activity stream.
 */
export async function postActivityNotification(
  empId: string,
  fullName: string,
  department: string,
  action: string,
  detail: string,
  score?: number
): Promise<boolean> {
  try {
    const response = await fetch('/api/activity-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empId, fullName, department, action, detail, score })
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Imports employees into the server-side database.
 */
export async function importEmployeesToServer(employees: any[]): Promise<boolean> {
  try {
    const response = await fetch('/api/trainees/batch-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employees })
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Resets all test progress on the server.
 */
export async function resetServerDatabase(): Promise<boolean> {
  try {
    const response = await fetch('/api/trainees/reset-all', {
      method: 'POST'
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Resets the learning progress and test history for a specific trainee on the server.
 */
export async function resetSingleTraineeOnServer(empId: string): Promise<boolean> {
  try {
    const cleanId = empId.trim().toUpperCase();
    const response = await fetch(`/api/trainees/${encodeURIComponent(cleanId)}/reset`, {
      method: 'POST'
    });
    return response.ok;
  } catch (e) {
    console.debug('Failed to reset single trainee on server', e);
    return false;
  }
}

