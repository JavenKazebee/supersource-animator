import { Server } from "socket.io"
import { Atem } from "atem-connection";
import type { AtemIPMessage, CreateLayoutMessage, SetSuperSourceLayoutMessage } from "./types.ts";
import { SuperSource } from "./node_modules/atem-connection/dist/state/video/superSource.d.ts";
import type { SuperSourceBox } from "atem-connection/dist/state/video/superSource.js";
import { loadState, saveState } from "./state.ts";

const atem = new Atem();

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
    createLayout(message.name, message.superSource);
    socket.emit("layouts", {layouts: state.layouts})
  });

  // Give frontend list of layouts
  socket.on("getLayouts", () => {
    socket.emit("layouts", state.layouts);
  });

  // Set supersource to match layout
  socket.on("setSuperSourceLayout", (message: SetSuperSourceLayoutMessage) => {
    setSuperSourceLayout(message.superSource, message.layout);
  });

  socket.on("atemIP", (message: AtemIPMessage) => {
    state.atemIP = message.atemIP;
    connectToAtem();
  });

  // Send layouts and IP on connection
  socket.emit("layouts", {layouts: state.layouts});
  socket.emit("atemIP", {atemIP: state.atemIP});

  console.log("connection!");
});

io.listen(3000);  

connectToAtem();

function createLayout(name: string, superSource: number) {
  state.layouts.push({
    name: name,
    superSource: atem.state?.video.superSources[superSource] as SuperSource,
  });

  saveState(state);
}

// Set SuperSource to a specific layout
function setSuperSourceLayout(superSource: number, layout: number) {
  const boxes = state.layouts[layout].superSource.boxes;
  for(let i = 0; i < boxes.length; i++) {
    atem.setSuperSourceBoxSettings(boxes[i] as SuperSourceBox, i, superSource)
  }
}

function connectToAtem() {
  atem.on('info', console.log);
  atem.on('error', console.error);

  atem.connect(state.atemIP);

  atem.on("connected", () => {
    console.log("Connected!");
    io.emit("atemConnection", {connected: true});
  });

  atem.on("disconnected", () => {
    console.log("Disconnected!");
    io.emit("atemConnection", {connected: false});
  });
}

function animationTest() {
  const startX = 0; // Start position
  const endX = 10; // End position
  const frameRate = 10; // Moves per second
  const duration = 2000; // MS duration of animation

  const frames = duration / frameRate;
  const movementPerFrame = (endX - startX) / frames;
  const delay = 1000 / frameRate;

  animate(startX, 0, frames, movementPerFrame, delay);
}

function animate(currentX: number, frameCount: number, frames: number, increment: number, delay: number) {
  // Return once we've reached the frame count
  if(frameCount >= frames) {
    return;
  }

  // Update position
  const newX = currentX + increment;
  atem.setSuperSourceBoxSettings({x: newX}, 0, 1);

  // call the next frame of the animation
  setTimeout(() => animate(newX, frameCount + 1, frames, increment, delay), delay);
}