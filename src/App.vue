<script setup lang="ts">
import { computed, ref } from "@vue/reactivity";
import { fetchServers, useServersStore } from "./stores/servers-store";

const matchSubstring = (source: string, substr: string) =>
  source.toLowerCase().includes(substr.toLowerCase());

const filterSubstring = ref<string>("AE");

const serversStore = useServersStore();
const servers = computed(() =>
  serversStore.selectAll((server) =>
    matchSubstring(server.name, filterSubstring.value)
  )
);

const load = () => {
  serversStore.clearEntities();
  fetchServers();
};

const loadWithError = () => {
  serversStore.clearEntities();
  fetchServers(true);
};
</script>

<template>
  <div>
    <button @click="load">Load servers</button>
    <button @click="loadWithError">Loading error</button>
  </div>

  <div>
    <input v-model="filterSubstring" placeholder="Filter" />
  </div>

  <div v-if="serversStore.selectIsLoading()">LOADING ...</div>
  <div v-if="serversStore.selectRequestError()" style="color: red">
    LOADING ERROR
  </div>

  <div v-for="server of servers">
    {{ server.name }}
  </div>
</template>

<style scoped></style>
