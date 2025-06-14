export {};

declare global {
    interface Window {
        electronAPI: {
            ReadDirectory: (directory: string | null) => Promise<FileItem[] | {error: string}>,
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
        is_directory: boolean,
    }
}