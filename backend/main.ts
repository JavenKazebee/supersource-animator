import { Server } from "socket.io"
import { Atem } from "atem-connection";
import type { CreateLayoutMessage, Layout } from "./types.ts";
import { SuperSource } from "./node_modules/atem-connection/dist/state/video/superSource.d.ts";

const atem = new Atem();
let layouts: Layout[] = [];


// Socket.io setup
const io = new Server({
  cors: {
    origin: "http://localhost:5173"
  }
});

io.on("connection", socket => {
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  })

  socket.on("createLayout", (message: CreateLayoutMessage) => {
    createLayout(message.name, message.superSource);
    socket.emit("layoutsUpdated", {layouts: layouts})
  });

  socket.on("getLayouts", () => {
    socket.emit("layouts", layouts);
  });

  socket.emit("layoutsUpdated", {layouts: layouts});

  console.log("connection!");
});

io.listen(3000);  

connectToAtem();

function createLayout(name: string, superSource: number) {
  layouts.push({
    name: name,
    superSource: atem.state?.video.superSources[superSource] as SuperSource,
  });
}

function connectToAtem() {
  atem.on('info', console.log);
  atem.on('error', console.error);

  atem.connect("192.168.10.240");

  atem.on("connected", () => {
    console.log("Connected!");
  });


  atem.on('stateChanged', (state, pathToChange) => {
    console.log(state);
  });

}