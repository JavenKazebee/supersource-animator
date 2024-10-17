import { io } from "socket.io-client";

export function connect() {
    const socket = io();

    socket.emit("hello");
}