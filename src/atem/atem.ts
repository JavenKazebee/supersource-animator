import { Atem } from "atem-connection";
import Layout from "./layout";
import { SuperSourceBox } from "atem-connection/dist/state/video/superSource";

const atem = new Atem();

export function connect() {
    atem.on('info', console.log);
    atem.on('error', console.error);

    atem.connect("");

    atem.on('connected', () => {
        console.log(atem.status);
    });

    atem.on('stateChanged', (state, pathToChange) => {
        console.log(state)
    })
}

export function getSuperSource(index: number) {
    return atem.state?.video.superSources[index];
}

export function setSuperSourceLayout(ssIndex: number, layout: Layout) {
    let boxIndex = 0;
    // Set each box
    for(const box of layout.superSource.boxes) {
        atem.setSuperSourceBoxSettings(box as SuperSourceBox, boxIndex, ssIndex);
        boxIndex++;
    }
}