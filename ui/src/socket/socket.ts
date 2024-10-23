import { io } from "socket.io-client";
import { CreateLayoutMessage, Layout, LayoutsMessage } from "../../../backend/types"
import { ref } from "vue";

const socket = io("localhost:3000");
export const layouts = ref([] as Layout[])

socket.on("layoutsUpdated", (data: LayoutsMessage) => {
    layouts.value = data.layouts;
})

export function sendMessage(message: CreateLayoutMessage) {
    socket.emit("createLayout", message);
}