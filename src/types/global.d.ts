import DirectoryNode from "./DirectoryNode";
export {};

declare global {
    interface Window {
        electronAPI: {
            GetOSInfo: () => Promise<OsiInfo>,
            SelectDirectory: () => Promise<string | null>,
            ReadDirectory: (directory: string | null) => Promise<DirectoryNode | null>,
        };
    }

    type FileInfoHeader = {
        key: string,
        text: string,
        formatter: ((val: any) => any) | null,
    }

    type FileInfo = {
        relative_idx: number,
        file_name: string,
        file_size: number,
        file_path: string,
        is_directory: boolean,
    }

    type OsiInfo = {
        rootdir: string, 
        homedir: string, 
        tmpdir: string, 
        hostname: string
    }
}