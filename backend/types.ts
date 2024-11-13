import { SuperSource } from "./node_modules/atem-connection/dist/state/video/superSource.d.ts";

export interface Layout {
    id: number;
    name: string;
    superSource: SuperSource;
}

export interface CreateLayoutMessage {
    name: string;
    superSource: number;
}

export interface LayoutsMessage {
    layouts: Layout[];
    layoutOrder: number[];
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

export interface AnimateMessage {
    superSource: number;
    layout: number;
}

export interface DeleteLayoutMessage {
    layout: number;
}

export interface LayoutOrderMessage {
    layoutOrder: number[];
}