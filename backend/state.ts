import type { Layout } from "./types.ts";

export interface State {
    atemIP: string;
    layouts: Map<number, Layout>;
    layoutIDCounter: number;
}

export function saveState(state: State) {
    const layoutObj = Object.fromEntries(state.layouts);
    const newState = {
        atemIP: state.atemIP,
        layouts: layoutObj,
        layoutIDCounter: state.layoutIDCounter
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
        console.log(error);
        // Return empty state if no file
        return {atemIP: "",layouts: new Map<number, Layout>(), layoutIDCounter: 0} as State;
    }
}