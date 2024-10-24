import { SuperSource } from "./node_modules/atem-connection/dist/state/video/superSource.d.ts";

export interface Layout {
    name: string;
    superSource: SuperSource;
}

export interface CreateLayoutMessage {
    name: string;
    superSource: number;
}

export interface LayoutsMessage {
    layouts: Layout[]
}

export interface SetSuperSourceLayoutMessage {
    superSource: number;
    layout: number;
}

export interface AtemIPMessage {
    atemIP: string;
}

export interface AtemConnectionMessage {
    connected: boolean;
}