import { defineStore } from "pinia";

interface DefineEntityStoreOptions<T> {
  selectId: (entity: T) => PropertyKey;
}

type RequestStatus = "idle" | "pending" | "success" | "error";

type State<T, ID extends PropertyKey> = {
  ids: ID[];
  entities: T[];
  entitiesById: Record<ID, T>;
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
      entitiesById: {},
      requestStatus: "idle",
    }),

    getters: {
      selectAll(state) {
        return (filter?: (entity: T) => boolean) => {
          const entities = state.entities as T[];
          return filter ? entities.filter(filter) : state.entities;
        };
      },

      selectById(state) {
        return (id: ID) => state.entitiesById[id];
      },

      selectIsLoading(state) {
        return () => state.requestStatus === "pending";
      },

      selectRequestError(state) {
        return () => state.requestStatus === "error";
      },
    },

    actions: {
      setEntities(entities: T[]) {
        const entitiesById = Object.fromEntries(
          entities.map((x) => [selectId(x), x])
        );

        this.$patch({
          ids: entities.map((x) => selectId(x)),
          entities,
          entitiesById,
        });
      },

      clearEntities() {
        this.$patch({
          ids: [],
          entities: [],
          entitiesById: {},
        });
      },

      setRequestStatus(status: RequestStatus) {
        this.requestStatus = status;
      },
    },
  });
};

export const loadStoreEntities = <T>(
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
