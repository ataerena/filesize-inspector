<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import DirectoryNode from './types/DirectoryNode';
import locale from './language.json';

const currentNode = ref<DirectoryNode | null>(null);
const loading = ref<boolean>(false);

const lightmode = ref<boolean>(false);
const selectedLanguage = ref<string>('en');

const files_frame_headers = computed(() => {
  const headers: FileInfoHeader[] = [
    {
      key: 'is_directory',
      text: (locale as Record<string, any>)[selectedLanguage.value]['is_directory'],
      flex: 1,
    },
    {
      key: 'file_name',
      text: (locale as Record<string, any>)[selectedLanguage.value]['file_name'],
      flex: 4,
    },
    {
      key: 'file_size',
      text: (locale as Record<string, any>)[selectedLanguage.value]['file_size'],
      flex: 2,
    },
    {
      key: 'file_size_percentage',
      text: (locale as Record<string, any>)[selectedLanguage.value]['file_size_percentage'],
      flex: 4,
    },
  ];

  return headers;
});

const available_languages: string[] = ['en', 'tr'];

onMounted(() => {
  let _lightmode: boolean = (localStorage.getItem('lightmode') === 'true' ? true : false);
  SetLightMode(_lightmode);
});

function SetLightMode(_lightmode: boolean) {
  lightmode.value = _lightmode;
  localStorage.setItem('lightmode', String(_lightmode));

  if (lightmode.value === true) {
    document.documentElement.classList.add('light-scheme');
  } else {
    document.documentElement.classList.remove('light-scheme');
  }
}

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

function ForceQuit() {
  window.electronAPI.ForceQuit();
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

async function SortBy(key: string): Promise<void> {
  if (currentNode.value === null) return;

  if (currentNode.value.info.order_key != key) {
    currentNode.value.info.order_increasingly = true;
  } else {
    currentNode.value.info.order_increasingly = !currentNode.value.info.order_increasingly;
  }
  currentNode.value.info.order_key = key;

  if (key === 'file_name') {
    currentNode.value.children.sort((a, b) => {
      if (currentNode.value != null && currentNode.value.info.order_increasingly === true) {
        return (b.info as Record<string, any>)[key].localeCompare((a.info as Record<string, any>)[key]);
      } else {
        return (a.info as Record<string, any>)[key].localeCompare((b.info as Record<string, any>)[key]);
      }
    });
  } else {
    currentNode.value.children.sort((a, b) => {
      if (currentNode.value != null && currentNode.value.info.order_increasingly === true) {
        return (b.info as Record<string, any>)[key] - (a.info as Record<string, any>)[key];
      } else {
        return (a.info as Record<string, any>)[key] - (b.info as Record<string, any>)[key];
      }
    });
  }
}

</script>

<template>
  <div class="wrapper">
    <div class="centered-item" v-if="loading" style="text-align: center;">
      <fa-icon class="loading-spinner" :icon="['fa', 'spinner']"/>
      <div style="font-size: 1.5vw; margin-bottom: 1em;">
        {{ (locale as Record<string, any>)[selectedLanguage]['loading_tip'] }}
      </div>
      <button @click="ForceQuit()">
        {{ (locale as Record<string, any>)[selectedLanguage]['force_quit'] }}
      </button>
    </div>

    <div class="main-frame" v-else>
      <div class="top-navbar">
        <button v-if="currentNode" @click="SetCurrentNode(currentNode.parent)" :disabled="currentNode.parent === null">
          {{ (locale as Record<string, any>)[selectedLanguage]['back'] }}
        </button>
        <button v-else disabled>
          {{ (locale as Record<string, any>)[selectedLanguage]['back'] }}
        </button>

        <div>
          <input type="checkbox" id="lightmode-checkbox" v-model="lightmode" @change="SetLightMode(lightmode)">
          <label for="lightmode-checkbox">{{ (locale as Record<string, any>)[selectedLanguage]['lightmode'] }}</label>
        </div>
        
        <div style="border-left: thin solid var(--headers-row-bottom-border); padding: 0 1em 0 1em"
          :style="{borderRight: currentNode !== null ? 'thin solid var(--headers-row-bottom-border)' : 'none'}"
        >
          <select id="language-select" v-model="selectedLanguage">
            <option v-for="item in available_languages"
              :value="item"
              :key="item"
            >
              {{ item.toUpperCase() }}
            </option>
          </select>
        </div>

        <div v-if="currentNode" style="font-weight: bold; font-size: 1vw;">
          <span style="user-select: text !important;">{{ currentNode.info.file_path }}</span> - {{ FormatBytes(currentNode.info.file_size) }}
        </div>

        <button class="centered-item" @click="HandleClickSelectDirectory()">
          {{ (locale as Record<string, any>)[selectedLanguage]['select_directory'] }}
        </button>
      </div>

      <div class="headers-row">
        <div v-for="header in files_frame_headers" :key="header.key" 
          class="file-item-col" :class="{'currently-sorted-key': currentNode?.info.order_key === header.key}" :style="{flex: header.flex}"
          @click="SortBy(header.key)"
        >
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
              &nbsp;{{ (locale as Record<string, any>)[selectedLanguage]['directory'] }}
            </span>
            <span v-else>
              <fa-icon :icon="['fas', 'file']" />
              &nbsp;{{ (locale as Record<string, any>)[selectedLanguage]['file'] }}
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

    color: var(--main-color);
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
      align-items: flex-end;
    
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
      border-bottom: thin solid var(--headers-row-bottom-border);

      > .file-item-col {
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }

      > .currently-sorted-key {
        text-decoration: underline !important;
      }
    }

    > .file-item-row {
      border-bottom: thin solid var(--file-item-row-bottom-border);

      cursor: pointer;
      transition: background-color 250ms;
      &:hover {
        background-color: var(--file-item-row-background-color--hover);
      }
    }
  }

  .loading-spinner {
    font-size: 5vw;
    margin-bottom: 1rem;
    animation: Spin 1000ms ease-in-out infinite;
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
    outline: thin solid var(--main-color);
    padding: 0 !important;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    height: 100%;

    position: relative;

    > .used-space-bar {
      height: 100%;
      background-color: var(--used-space-bar-bg-color);
    }

    > .used-space-text {
      color: var(--used-space-bar-text-color);
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
