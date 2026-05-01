export interface ProtocolProcessor {
    mode: string;
    process: (input: string) => Promise<string>;
}

export interface InferenceEngine {
    classify: (input: string) => Promise<number>;
    search: (query: string) => Promise<string>;
}
