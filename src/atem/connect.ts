import { Atem } from "atem-connection";

export default function connect() {
    const atem = new Atem();
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