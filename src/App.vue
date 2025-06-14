<script setup lang="ts">
import {ref, onMounted} from 'vue';

const files = ref<string[]>([]);
const error = ref<string | null>(null);

onMounted(async function() {
  await ReadInitialDirectory();
  await HandleDirectoryRead();
});

async function ReadInitialDirectory() {
  const result = await window.electronAPI.ReadInitialDirectory();
  if (Array.isArray(result)) {
    files.value = result;
    error.value = null;
  } else {
    error.value = result.error;
  }
}

async function HandleDirectoryRead() {
  if (error.value) {
    alert(error.value);
  } else {
    console.log("Files: ", files.value);
  }
}

</script>

<template>
  <div>
    deneme
  </div>
</template>

<style scoped>

</style>
