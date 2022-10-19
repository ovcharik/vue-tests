import { defineEntityStore, loadStoreEntities } from "./entity-store";

export interface Server {
  uuid: string;
  name: string;
}

export const useServersStore = defineEntityStore<Server>("servers", {
  selectId: (server) => server.uuid,
});

export const fetchServers = (withError = false) => {
  const errorPromise = () =>
    new Promise<Server[]>((resolve, reject) => {
      setTimeout(reject.bind(null, new Error("loading error")), 1000);
    });

  const loadPromise = () =>
    fetch("https://api.selectel.ru/servers/v2/pub/service/server")
      .then((response) => response.json())
      .then((json: { result: Server[] }) => json.result);

  const store = useServersStore();
  const request = withError ? errorPromise() : loadPromise();
  return loadStoreEntities(store, request);
};
