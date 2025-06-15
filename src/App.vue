<script setup lang="ts">
import { ref } from 'vue';
import DirectoryNode from './types/DirectoryNode';

const currentNode = ref<DirectoryNode | null>(null);
const loading = ref<boolean>(false);

const files_frame_headers: FileInfoHeader[] = [
  {
    key: 'is_directory',
    text: 'Type',
    flex: 1,
  },
  {
    key: 'file_name',
    text: 'File Name',
    flex: 4,
  },
  {
    key: 'file_size',
    text: 'File Size',
    flex: 2,
  },
  {
    key: 'file_size_percentage',
    text: 'Used Space',
    flex: 4,
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

    if (currentNode.value) {
      currentNode.value.info['file_size_percentage'] = 100;

      for (let i = 0; i < currentNode.value.children.length; i++) {
        const node = currentNode.value.children[i];
        node.info['file_size_percentage'] = await GetPercentage(node.info.file_size);
      }
    }
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
  if (node === null)
    return;
  
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

async function GetPercentage(bytes: number): Promise<number> {
  if (!currentNode || !currentNode.value) return NaN;

  return Number(((bytes / currentNode.value.info.file_size) * 100).toFixed(4));
}

</script>

<template>
  <div class="wrapper">
    <div class="centered-item" v-if="loading">
      <fa-icon class="loading-spinner" :icon="['fa', 'spinner']" />
    </div>

    <div class="main-frame" v-else-if="!loading">
      <div class="top-navbar">
        <button v-if="currentNode" @click="SetCurrentNode(currentNode.parent)">
          Back
        </button>
        <button v-else disabled>
          Back
        </button>

        <button class="centered-item" @click="HandleClickSelectDirectory()">
          Click to select directory / folder
        </button>
      </div>

      <div class="headers-row">
        <div v-for="header in files_frame_headers" :key="header.key" class="file-item-col" :style="{flex: header.flex}">
          {{ header.text }}
        </div>
      </div>

      <div v-if="currentNode" v-for="node in currentNode.children" :key="node.info.relative_idx" class="file-item-row"
        :class="{'no-pointer': !node.info.is_directory}" @click="SetCurrentNode(node)">
        <div v-for="header in files_frame_headers" :key="header.key" class="file-item-col" :style="{flex: header.flex}">
          <div v-if="header.key === 'file_size'">
            {{ FormatBytes((node.info as Record<string, any>)['file_size']) }}
          </div>

          <div v-else-if="header.key === 'is_directory'">
            <span v-if="(node.info as Record<string, any>)['is_directory'] === true">
              <fa-icon :icon="['fas', 'folder']" />
              &nbsp;Directory
            </span>
            <span v-else>
              <fa-icon :icon="['fas', 'file']" />
              &nbsp;File
            </span>
          </div>

          <div v-else-if="header.key === 'file_size_percentage'" class="used-space-container">
            <div class="used-space-bar"
              :style="{width: `${(node.info as Record<string, any>)['file_size_percentage']}%`}"></div>
            <div class="used-space-text">
              {{ `${(node.info as Record<string, any>)['file_size_percentage']}%` }}
            </div>
          </div>

          <div v-else>
            {{ (node.info as Record<string, any>)[header.key] }}
          </div>
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
      align-items: stretch;

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

  .loading-spinner {
    animation: Spin 500ms linear infinite;
  }

  @keyframes Spin {
    0% {
      transform: rotate(0)
    } 100% {
      transform: rotate(360deg);
    }
  }

  .used-space-container {
    border-radius: .35em;
    outline: thin solid rgba(255, 255, 255, 0.5);
    padding: 0 !important;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    height: 100%;

    position: relative;

    > .used-space-bar {
      height: 100%;
      background-color: rgb(78, 115, 22);
    }

    > .used-space-text {
      color: whitesmoke;
      font-size: 1vw;
      font-weight: normal;
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      text-align: center;
      vertical-align: center;
    }
  }
</style>
