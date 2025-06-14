<script setup lang="ts">
import {ref, onMounted} from 'vue';
import DirectoryNode from './types/DirectoryNode';

const currentNode = ref<DirectoryNode | null>(null);
const loading = ref<boolean>(false);

const files_frame_headers: FileInfoHeader[] = [
  {
    key: 'is_directory',
    text: 'Type',
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
    formatter: function (bytes: number) { return FormatBytes(bytes) }
  },
];

async function HandleClickSelectDirectory() {
  const directory = await window.electronAPI.SelectDirectory();
  if (directory) {
    await ReadDirectory(directory);
  }
}

async function ReadDirectory(directory: string | null): Promise<void> {
  try {
    await SetLoading(true);
    currentNode.value = await window.electronAPI.ReadDirectory(directory);
  } catch (error: any) {
    console.log(error.message)
  } finally {
    await SetLoading(false);
  }
}

async function SetLoading(_loading: boolean): Promise<void> {
  loading.value = _loading;
}

function SetCurrentNode(node: DirectoryNode | null) {
  currentNode.value = node;
}

function FormatBytes(bytes: number): string {
  const kB = 1024;
  const MB = 1048576;
  const GB = 1073741824;
  const TB = 1099511627776;
  const PB = 1125899906842624;

  const FIX_TO = 2;
  if (bytes < kB) {
    return `${bytes}B`;
  } else if (bytes >= kB && bytes < MB) {
    return `${(bytes/kB).toFixed(FIX_TO)}kB`;
  } else if (bytes >= MB && bytes < GB) {
    return `${(bytes/MB).toFixed(FIX_TO)}MB`;
  } else if (bytes >= GB && bytes < TB) {
    return `${(bytes/GB).toFixed(FIX_TO)}GB`;
  } else if (bytes >= TB && bytes < PB) {
    return `${(bytes/TB).toFixed(FIX_TO)}TB`;
  } else {
    return `${(bytes/PB).toFixed(FIX_TO)}PB`;
  }
}

</script>

<template>
  <div class="wrapper">
    <button class="centered-item" @click="HandleClickSelectDirectory()" v-if="!currentNode && !loading">
      Click to select directory / folder
    </button>

    <div class="centered-item" v-else-if="!currentNode && loading">
      Loading...
    </div>

    <div class="main-frame" v-else-if="currentNode && !loading">
      <div class="top-navbar">
        <button @click="SetCurrentNode(currentNode.parent)" v-if="currentNode.parent">
          Back
        </button>
      </div>

      <div class="headers-row">
        <div v-for="header in files_frame_headers" :key="header.key" class="file-item-col">
          {{ header.text }}
        </div>
      </div>

      <div v-for="node in currentNode.children" :key="node.info.relative_idx" 
        class="file-item-row" :class="{'no-pointer': !node.info.is_directory}" 
        @click="SetCurrentNode(node)"
      >
        <div v-for="header in files_frame_headers" :key="header.key" class="file-item-col">
          <span v-if="header.formatter">
            {{ header.formatter((node.info as Record<string, any>)[header.key]) }}
          </span>

          <span v-else-if="header.key === 'is_directory'">
            <fa-icon :icon="(node.info as Record<string, any>)['is_directory'] === true ? ['fas', 'folder'] : ['fas', 'file']" />
          </span>

          <span v-else>
            {{ (node.info as Record<string, any>)[header.key] }}
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

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .main-frame {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    > .top-navbar {
      width: 100%;
      padding: 1em .5em;
    
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
    
      >* {
        margin-right: 1em;
      }
    }

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
