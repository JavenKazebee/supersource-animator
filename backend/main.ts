import { Server } from "socket.io"
import { Atem } from "atem-connection";
import type { AnimateMessage, AtemIPMessage, CreateLayoutMessage, DeleteLayoutMessage, Layout, SetSuperSourceLayoutMessage } from "./types.ts";
import { SuperSource } from "./node_modules/atem-connection/dist/state/video/superSource.d.ts";
import { SuperSourceBox } from "atem-connection/dist/state/video/superSource.js";
import { loadState, saveState } from "./state.ts";
import { animateBetweenLayouts } from "./animation.ts";

const atem = new Atem();
let atemConnected = false;

// Load state from file
const state = await loadState();

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

  // Create and store a new layout
  socket.on("createLayout", (message: CreateLayoutMessage) => {
    if(atemConnected) {
      createLayout(message.name, message.superSource);
      socket.emit("layouts", {layouts: Array.from(state.layouts.values())});
    }
  });

  // Give frontend list of layouts
  socket.on("getLayouts", () => {
    socket.emit("layouts", {layouts: Array.from(state.layouts.values())});
  });

  // Set supersource to match layout
  socket.on("setSuperSourceLayout", (message: SetSuperSourceLayoutMessage) => {
    if(atemConnected) {
      setSuperSourceLayout(message.superSource, message.layout);
    }
  });

  // Reconnect to atem when client sends new atemIP
  socket.on("atemIP", (message: AtemIPMessage) => {
    state.atemIP = message.atemIP;
    connectToAtem();
  });

  // Animate between current layout and selected layout
  socket.on("animate", (message: AnimateMessage) => {
    if(atemConnected) {
      if(state.layouts.has(message.layout)) {
        const current = atem.state?.video.superSources[message.superSource] as SuperSource
        animateBetweenLayouts(atem, current, state.layouts.get(message.layout)!.superSource, 60, 1000, 1);
      } else {
        console.log("Layout not found");
      }
    }
  });

  socket.on("deleteLayout", (message: DeleteLayoutMessage) => {
    state.layouts.delete(message.layout);
    saveState(state);
    socket.emit("layouts", {layouts: Array.from(state.layouts.values())});
  });

  // Send layouts and IP on connection
  socket.emit("layouts", {layouts: Array.from(state.layouts.values())});
  socket.emit("atemConnection", {connected: atemConnected});
  socket.emit("atemIP", {atemIP: state.atemIP});

  console.log("connection!");
});

io.listen(3000);  

connectToAtem();

function createLayout(name: string, superSource: number) {
  const ss: SuperSource = JSON.parse(JSON.stringify(atem.state?.video.superSources[superSource] as SuperSource));
  const layout: Layout = {
    id: state.layoutIDCounter++,
    name: name,
    superSource: ss,
  }

  state.layouts.set(layout.id, layout);
  saveState(state);
}

// Set SuperSource to a specific layout
function setSuperSourceLayout(superSource: number, layout: number) {
  if(state.layouts.has(layout)) {
    const boxes = state.layouts.get(layout)!.superSource.boxes;
    for(let i = 0; i < boxes.length; i++) {
      atem.setSuperSourceBoxSettings(boxes[i] as SuperSourceBox, i, superSource)
    }
  } else {
    console.log("Layout not found");
  }
}

function connectToAtem() {
  atem.on('info', console.log);
  atem.on('error', console.error);

  atem.connect(state.atemIP);

  atem.on("connected", () => {
    console.log("Connected!");
    atemConnected = true;
    io.emit("atemConnection", {connected: atemConnected});
  });

  atem.on("disconnected", () => {
    console.log("Disconnected!");
    atemConnected = false;
    io.emit("atemConnection", {connected: atemConnected});
  });
}

