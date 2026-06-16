export interface Document {
    name?: string;
    url?: string;
    content?: string;
}

export function isDocument(arg: unknown): arg is Document {
    return (arg as Document).url !== undefined;
}
