import { customRef, triggerRef, type Ref } from "vue";

// helper
const isString = (data: unknown): data is string => {
  return typeof data === 'string';
}

let isSupported = true;
const fallbackStorage = {} as Record<string, string>;
const refsCache = new Map<string, Ref>();

try {
  const testKey = "__vue-local-storage-test-key__";
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
} catch (e) {
  console.warn("LocalStorage is not supported", e);
  isSupported = false;
}

// safe localStorage.getItem and parse
const getItem = <T>(key: string): T | null => {
  const json = isSupported
    ? window.localStorage.getItem(key)
    : fallbackStorage[key];
  return json ? (JSON.parse(json) as T) : null;
};

// serialize data and safe localStorage.setItem
const setItem = <T>(key: string, value: T) => {
  const json = JSON.stringify(value);
  if (isSupported) {
    window.localStorage.setItem(key, json);
  } else {
    fallbackStorage[key] = json;
  }
};

// listen local storage changes from other tabs
window.addEventListener('storage', (event: StorageEvent) => {
  if (!isString(event.key)) return;
  const ref = refsCache.get(event.key);
  if (!ref) return;
  triggerRef(ref);
});

// create ref and link it with local storage
export const localStorageItemRef = <T>(key: string, def: T): Ref<T> => {
  if (refsCache.has(key)) {
    return refsCache.get(key) as Ref<T>;
  }

  const ref = customRef<T>((track, trigger) => {
    return {
      get() {
        track();
        const item = getItem<T>(key);
        return item ?? def;
      },

      set(value) {
        setItem(key, value);
        trigger();
      },
    };
  });

  refsCache.set(key, ref);
  return ref;
};
