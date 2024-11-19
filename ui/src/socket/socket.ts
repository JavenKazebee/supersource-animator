import { io } from "socket.io-client";
import { AnimationDurationMessage, AnimationFPSMessage, AtemConnectionMessage, AtemIPMessage, CreateLayoutMessage, DeleteLayoutMessage, Layout, LayoutOrderMessage, LayoutsMessage, SetSuperSourceLayoutMessage } from "../../../backend/types"
import { ref } from "vue";

const socket = io("localhost:3000");
export const layouts = ref([] as Layout[]);
export const atemIP = ref("");
export const atemConnected = ref(false);
export const layoutOrder = ref([] as number[]);
export const animationFPS = ref(60);
export const animationDuration = ref(1000);

socket.on("layouts", (data: LayoutsMessage) => {
    layouts.value = data.layouts;
    layoutOrder.value = data.layoutOrder;
});

socket.on("atemIP", (data: AtemIPMessage) => {
    atemIP.value = data.atemIP;
});

socket.on("atemConnection", (data: AtemConnectionMessage) => {
    atemConnected.value = data.connected;
});

socket.on("animationFPS", (data: AnimationFPSMessage) => {
    animationFPS.value = data.fps;
});

socket.on("animationDuration", (data: AnimationDurationMessage) => {
    animationDuration.value = data.duration;
});

export function sendMessage(name: string, message: CreateLayoutMessage | SetSuperSourceLayoutMessage | 
    AtemIPMessage | DeleteLayoutMessage | LayoutOrderMessage | AnimationFPSMessage | AnimationDurationMessage) {
    socket.emit(name, message);
}