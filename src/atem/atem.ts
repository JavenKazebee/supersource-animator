import { Atem } from "atem-connection";

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