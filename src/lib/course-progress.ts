export const COURSE_PROGRESS_VERSION = 1;
export const COURSE_PROGRESS_KEY = "optimize-local:ai-confidence:sample-progress:v1";
export const SAMPLE_LESSON_IDS = ["day-01", "day-02", "day-03"] as const;

export type SampleLessonId = (typeof SAMPLE_LESSON_IDS)[number];
export type CourseProgress = {
  version: typeof COURSE_PROGRESS_VERSION;
  completed: SampleLessonId[];
  revisions: Partial<Record<SampleLessonId, string>>;
};
export type ProgressSnapshot = {
  hydrated: boolean;
  progress: CourseProgress;
  storage: "loading" | "available" | "memory" | "recovered";
  notice: string;
};
export type ProgressStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const emptyProgress = (): CourseProgress => ({ version: COURSE_PROGRESS_VERSION, completed: [], revisions: {} });
const serverSnapshot: ProgressSnapshot = {
  hydrated: false,
  progress: emptyProgress(),
  storage: "loading",
  notice: "Checking this browser’s sample progress…",
};

export function isSampleLessonId(value: unknown): value is SampleLessonId {
  return typeof value === "string" && SAMPLE_LESSON_IDS.some((id) => id === value);
}

const isRevision = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);

export function isCurrentCompletion(progress: CourseProgress, id: string, revision: string) {
  return isSampleLessonId(id) && progress.completed.includes(id) && progress.revisions[id] === revision;
}

export function readCourseProgress(raw: string | null): { progress: CourseProgress; recovered: boolean } {
  if (raw === null) return { progress: emptyProgress(), recovered: false };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid progress");
    const record = value as Record<string, unknown>;
    if (record.version !== COURSE_PROGRESS_VERSION || !Array.isArray(record.completed) || !record.revisions || typeof record.revisions !== "object" || Array.isArray(record.revisions)) throw new Error("Unsupported progress");
    const supplied = record.completed;
    const suppliedRevisions = record.revisions as Record<string, unknown>;
    const completed = SAMPLE_LESSON_IDS.filter((id) => supplied.includes(id) && isRevision(suppliedRevisions[id]));
    const revisions: CourseProgress["revisions"] = {};
    for (const id of completed) revisions[id] = suppliedRevisions[id] as string;
    return {
      progress: { version: COURSE_PROGRESS_VERSION, completed, revisions },
      recovered: supplied.length !== completed.length || supplied.some((id) => !isSampleLessonId(id)) || Object.keys(suppliedRevisions).some((id) => !isSampleLessonId(id) || !completed.includes(id)),
    };
  } catch {
    return { progress: emptyProgress(), recovered: true };
  }
}

const recoveryNotice = "Saved sample progress contained unreadable or unsupported entries. Only valid sample completions are shown; your next change replaces this preview’s saved progress.";
const memoryNotice = "Browser storage is unavailable. Progress works in this page’s memory, but changes will not survive a reload or follow you to another device.";

/** Only completion IDs are stored. Exercise text and personal information never enter this store. */
export function createCourseProgressStore(getStorage: () => ProgressStorage | null) {
  let snapshot = serverSnapshot;
  let storage: ProgressStorage | null = null;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  const initialize = () => {
    if (snapshot.hydrated) return;
    try {
      storage = getStorage();
      if (!storage) throw new Error("Storage unavailable");
      const result = readCourseProgress(storage.getItem(COURSE_PROGRESS_KEY));
      snapshot = {
        hydrated: true,
        progress: result.progress,
        storage: result.recovered ? "recovered" : "available",
        notice: result.recovered ? recoveryNotice : "Saved only in this browser. No account, enrollment, or paid-course progress is created.",
      };
    } catch {
      storage = null;
      snapshot = { hydrated: true, progress: emptyProgress(), storage: "memory", notice: memoryNotice };
    }
    emit();
  };
  const save = (progress: CourseProgress) => {
    initialize();
    try {
      if (!storage) throw new Error("Storage unavailable");
      storage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));
      snapshot = {
        hydrated: true,
        progress,
        storage: "available",
        notice: "Saved only in this browser. No account, enrollment, or paid-course progress is created.",
      };
    } catch {
      snapshot = { hydrated: true, progress, storage: "memory", notice: memoryNotice };
    }
    emit();
  };
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      initialize();
      return () => { listeners.delete(listener); };
    },
    setComplete(id: string, complete: boolean, revision?: string) {
      if (!isSampleLessonId(id) || (complete && !isRevision(revision))) return false;
      initialize();
      const selected = new Set(snapshot.progress.completed);
      const revisions = { ...snapshot.progress.revisions };
      if (complete) selected.add(id); else selected.delete(id);
      if (complete) revisions[id] = revision; else delete revisions[id];
      save({ version: COURSE_PROGRESS_VERSION, completed: SAMPLE_LESSON_IDS.filter((day) => selected.has(day)), revisions });
      return true;
    },
    reset() {
      initialize();
      try {
        if (!storage) throw new Error("Storage unavailable");
        storage.removeItem(COURSE_PROGRESS_KEY);
        snapshot = {
          hydrated: true, progress: emptyProgress(), storage: "available",
          notice: "Sample progress reset in this browser. Your saved exercise files are unchanged.",
        };
      } catch {
        snapshot = {
          hydrated: true, progress: emptyProgress(), storage: "memory",
          notice: "Progress reset for this page only. Browser storage could not be cleared, so earlier saved progress may return after a reload.",
        };
      }
      emit();
    },
    receiveStorageValue(raw: string | null) {
      initialize();
      const result = readCourseProgress(raw);
      snapshot = {
        hydrated: true, progress: result.progress,
        storage: result.recovered ? "recovered" : "available",
        notice: result.recovered ? recoveryNotice : "Sample progress updated from another tab in this browser.",
      };
      emit();
    },
  };
}

export const courseProgressStore = createCourseProgressStore(() => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
});

export function subscribeToCourseProgress(listener: () => void) {
  const unsubscribe = courseProgressStore.subscribe(listener);
  const receive = (event: StorageEvent) => {
    if (event.key === COURSE_PROGRESS_KEY || event.key === null) {
      courseProgressStore.receiveStorageValue(event.key === null ? null : event.newValue);
    }
  };
  window.addEventListener("storage", receive);
  return () => { unsubscribe(); window.removeEventListener("storage", receive); };
}
