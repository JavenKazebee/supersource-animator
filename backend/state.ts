import type { Layout } from "./types.ts";

export interface State {
    atemIP: string;
    layouts: Map<number, Layout>;
    layoutOrder: number[];
    layoutIDCounter: number;
    animationFPS: number;
    animationDuration: number;
}

export function saveState(state: State) {
    const layoutObj = Object.fromEntries(state.layouts);
    const newState = {
        atemIP: state.atemIP,
        layouts: layoutObj,
        layoutOrder: state.layoutOrder,
        layoutIDCounter: state.layoutIDCounter,
        animationFPS: state.animationFPS,
        animationDuration: state.animationDuration
    }
    Deno.writeTextFile("state.json", JSON.stringify(newState));
}

export async function loadState(): Promise<State> {
    try {
        const state = JSON.parse(await Deno.readTextFile("state.json"));
        // Maps don't load correctly from JSON, workarounds
        const entries = Object.entries(state.layouts);
        state.layouts = new Map<number, Layout>();
        for(let i = 0; i < entries.length; i++) {
            state.layouts.set(parseInt(entries[i][0]), entries[i][1]);
        }
        return state as State;

    } catch (error) {
        // Return empty state if no file
        return {atemIP: "", layouts: new Map<number, Layout>(), layoutOrder: [], layoutIDCounter: 0, animationFPS: 60, animationDuration: 1000} as State;
    }
}