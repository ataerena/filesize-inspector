export {};

declare global {
    interface Window {
        electronAPI: {
            ReadInitialDirectory: () => Promise<any | {error: string}>,
        };
    }
}