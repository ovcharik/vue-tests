import { defineEntityStore, requestEntities } from "./entity-store";

export interface Server {
  uuid: string;
  name: string;
}

export const useServersStore = defineEntityStore<Server>("servers", {
  selectId: (server) => server.uuid,
});

export const fetchServers = (withError = false) => {
  const store = useServersStore();

  const errorPromise = new Promise<Server[]>((resolve, reject) => {
    setTimeout(reject, 1000);
  })

  const request = withError
    ? errorPromise
    : fetch("https://api.selectel.ru/servers/v2/pub/service/server")
        .then((response) => response.json())
        .then((json: { result: Server[] }) => json.result);

  return requestEntities(store, request);
};
