import { customRef, triggerRef, type Ref } from "vue";

// helper
const isString = (data: unknown): data is string => {
  return typeof data === "string";
};

let isSupported = true;
const fallbackStorage = new Map<string, string>();
const refsCache = new Map<string, Ref>();
const valueCache = new Map<string, unknown>();

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
    : fallbackStorage.get(key);
  return json ? (JSON.parse(json) as T) : null;
};

// serialize data and safe localStorage.setItem
const setItem = <T>(key: string, value: T) => {
  const json = JSON.stringify(value);
  if (isSupported) {
    window.localStorage.setItem(key, json);
  } else {
    fallbackStorage.set(key, json);
  }
};

// listen local storage changes from other tabs
window.addEventListener("storage", (event: StorageEvent) => {
  if (!isString(event.key)) return;
  const ref = refsCache.get(event.key);
  if (!ref) return;
  // invalidate cache
  valueCache.delete(event.key);
  triggerRef(ref);
});

// create ref and link it with local storage through cache
export const localStorageItemRef = <T>(
  key: string,
  initialValue: T
): Ref<T> => {
  if (refsCache.has(key)) {
    return refsCache.get(key) as Ref<T>;
  }

  const ref = customRef<T>((track, trigger) => {
    return {
      get() {
        track();
        if (valueCache.has(key)) return valueCache.get(key) as T;
        const item = getItem<T>(key) ?? initialValue;
        valueCache.set(key, item);
        return item;
      },

      set(value) {
        setItem(key, value);
        valueCache.set(key, value);
        trigger();
      },
    };
  });

  refsCache.set(key, ref);
  return ref;
};
