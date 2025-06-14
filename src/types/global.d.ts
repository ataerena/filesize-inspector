export {};

declare global {
    interface Window {
        electronAPI: {
            ReadDirectory: (directory: string) => Promise<FileItem[] | {error: string}>,
            GetOSInfo: () => Promise<OsiInfo>,
        };
    }

    type FileItemHeader = {
        key: string,
        text: string,
        formatter: ((val: any) => any) | null,
    }

    type FileItem = {
        relative_idx: number,
        file_name: string,
        file_size: number,
        full_path: string,
        parent_path: string,
        is_directory: boolean,
    }

    type OsiInfo = {
        rootdir: string, 
        homedir: string, 
        tmpdir: string, 
        hostname: string
    }
}