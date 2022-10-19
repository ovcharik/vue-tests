<script setup lang="ts">
import { fetchServers, useServersStore } from "./stores/servers-store";
import { onMounted } from "vue";
import { computed } from "@vue/reactivity";

const serversStore = useServersStore();
const servers = computed(() => serversStore.selectAll());
const isLoading = computed(() => serversStore.selectIsLoading());
const isError = computed(() => serversStore.selectIsError());

const reload = () => {
  serversStore.clearEntities();
  fetchServers();
};

const error = () => {
  serversStore.clearEntities();
  fetchServers(true);
}
</script>

<template>
  <button @click="reload">Load servers</button>
  <button @click="error">Loading error</button>

  <div v-if="isLoading">LOADING ...</div>
  <div v-if="isError" style="color: red;">LOADING ERROR</div>

  <div v-for="server of servers">
    {{ server.name }}
  </div>
</template>

<style scoped></style>
