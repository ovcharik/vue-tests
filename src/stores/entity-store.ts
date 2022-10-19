import { defineStore } from "pinia";

interface DefineEntityStoreOptions<T> {
  selectId: (entity: T) => PropertyKey;
}

type RequestStatus = "idle" | "pending" | "success" | "error";

type State<T, ID> = {
  ids: ID[];
  entities: T[];
  requestStatus: RequestStatus;
};

type EntityStore<T> = ReturnType<ReturnType<typeof defineEntityStore<T>>>;

export const defineEntityStore = <T>(
  id: string,
  options: DefineEntityStoreOptions<T>
) => {
  const { selectId } = options;

  type ID = ReturnType<typeof selectId>;

  return defineStore(id, {
    state: (): State<T, ID> => ({
      ids: [],
      entities: [],
      requestStatus: "idle",
    }),

    getters: {
      selectAll(state) {
        return () => state.entities;
      },

      selectById(state) {
        return (id: ID) => state.entities.find((x) => selectId(x as T) === id);
      },

      selectIsLoading(state) {
        return () => state.requestStatus === 'pending';
      },

      selectIsError(state) {
        return () => state.requestStatus === 'error';
      },
    },

    actions: {
      setEntities(entities: T[]) {
        this.entities = entities as any;
        this.ids = entities.map((x) => selectId(x));
      },

      clearEntities() {
        this.entities = [];
        this.ids = [];
      },

      setRequestStatus(status: RequestStatus) {
        this.requestStatus = status;
      },
    },
  });
};

export const requestEntities = <T>(
  entityStore: EntityStore<T>,
  request: Promise<T[]>
) => {
  entityStore.setRequestStatus("pending");
  return request
    .then((result) => {
      entityStore.setEntities(result);
      entityStore.setRequestStatus("success");
      return result;
    })
    .catch((error) => {
      entityStore.setRequestStatus("error");
      throw error;
    });
};
