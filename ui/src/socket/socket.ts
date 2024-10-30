import { io } from "socket.io-client";
import { AtemConnectionMessage, AtemIPMessage, CreateLayoutMessage, DeleteLayoutMessage, Layout, LayoutsMessage, SetSuperSourceLayoutMessage } from "../../../backend/types"
import { ref } from "vue";

const socket = io("localhost:3000");
export let layouts = ref([] as Layout[]);
export const atemIP = ref("");
export const atemConnected = ref(false);

socket.on("layouts", (data: LayoutsMessage) => {
    layouts.value = data.layouts;
});

socket.on("atemIP", (data: AtemIPMessage) => {
    atemIP.value = data.atemIP;
});

socket.on("atemConnection", (data: AtemConnectionMessage) => {
    atemConnected.value = data.connected;
});


export function sendMessage(name: string, message: CreateLayoutMessage | SetSuperSourceLayoutMessage | AtemIPMessage | DeleteLayoutMessage) {
    socket.emit(name, message);
}