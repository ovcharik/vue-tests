<script lang="ts" setup>
import { localStorageItemRef } from "./local-storage";

const count = localStorageItemRef<number>("counter", 1);

const inc = () => {
  count.value += 1;
};
</script>

<template>
  <button v-on:click="inc()">Inc</button>
</template>
