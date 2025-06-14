<script setup lang="ts">
import {ref, onMounted} from 'vue';

const node = ref<FileItem[]>([]);
const error = ref<string | null>(null);

const files_frame_headers: FileItemHeader[] = [
  {
    key: 'is_directory',
    text: '',
    formatter: null,
  },
  {
    key: 'file_name',
    text: 'File Name',
    formatter: null,
  },
  {
    key: 'file_size',
    text: 'File Size',
    formatter: (bytes: number) => { return FormatBytes(bytes) }
  },
];

onMounted(async function() {
  await ReadDirectory(null);
});

async function ReadDirectory(item: FileItem | null): Promise<void> {
  try {
    if (item && item.is_directory === false) {
      return;
    }

    const result = await window.electronAPI.ReadDirectory(item?.full_path || null);
    if (Array.isArray(result)) {
      node.value = result;
      error.value = null;
    } else {
      error.value = null;
    }
  } catch (error: any) {
    console.log(error.message)
  } finally {
    await HandleDirectoryRead();
  }
}

async function HandleDirectoryRead() {
  if (error.value) {
    alert(error.value);
  } else {
    error.value = null;
  }
}

function FormatBytes(bytes: number): string {
  const kB = 1024;
  const MB = 1048576;
  const GB = 1073741824;
  const TB = 1099511627776;
  const PB = 1125899906842624;

  if (bytes < kB) {
    return `${bytes}B`;
  } else if (bytes >= kB && bytes < MB) {
    return `${(bytes/kB).toFixed(6)}kB`;
  } else if (bytes >= MB && bytes < GB) {
    return `${(bytes/kB).toFixed(6)}MB`;
  } else if (bytes >= GB && bytes < TB) {
    return `${(bytes/kB).toFixed(6)}GB`;
  } else if (bytes >= TB && bytes < PB) {
    return `${(bytes/kB).toFixed(6)}TB`;
  } else {
    return `${(bytes/PB).toFixed(6)}PB`;
  }
}

</script>

<template>
  <div class="wrapper">
    <div class="top-navbar">
      <button>
        Back
      </button>
    </div>

    <div class="main-frame">
      <div class="headers-row">
        <div v-for="header in files_frame_headers" :key="header.key"
          class="file-item-col"
        >
          {{ header.text }}
        </div>
      </div>

      <div v-for="file in node" :key="file.relative_idx"
        class="file-item-row" :class="{'no-pointer': !file.is_directory}"
        @click="ReadDirectory(file)"
      >
        <div v-for="header in files_frame_headers" :key="header.key"
          class="file-item-col"
        >
          <span v-if="header.formatter">
            {{ header.formatter((file as Record<string, any>)[header.key]) }}
          </span>

          <span v-else>
            {{ (file as Record<string, any>)[header.key] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .wrapper {
    width: 100% !important;
    height: 100% !important;
  }

  .top-navbar {
    width: 100%;
    padding: 1em .5em;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    > * {
      margin-right: 1em;
    }
  }

  .main-frame {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    > .headers-row, .file-item-row {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;

      > .file-item-col {
        flex: 1;
        padding: .5em 1vw;
        text-align: left;
        font-size: 1vw;
      }
    }

    > .headers-row {
      font-weight: bold;
      border-bottom: thin solid rgb(245, 245, 245);

      > .file-item-col {
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    > .file-item-row {
      border-bottom: thin solid rgb(213, 213, 213);

      cursor: pointer;
      transition: background-color 250ms;
      &:hover {
        background-color: rgba(255, 255, 255, 0.25);
      }
    }
  }
</style>
