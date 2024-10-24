import type { Layout } from "./types.ts";

export interface State {
    atemIP: string;
    layouts: Layout[];
}

export function saveState(state: State) {
    Deno.writeTextFile("state.json", JSON.stringify(state));
}

export async function loadState(): Promise<State> {
    try {
        const state = await Deno.readTextFile("state.json");
        return JSON.parse(state) as State;

    } catch (error) {
        // Return empty state if no file
        return {atemIP: "",layouts: []} as State;
    }
}