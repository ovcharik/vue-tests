<script lang="ts" setup>
import { localStorageItemRef } from "./local-storage";

const count = localStorageItemRef<number>("counter", 1);
</script>

<template>
  <div>{{ count }}</div>
</template>
