import { Server } from "socket.io"

const io = new Server();

io.on("connection", socket => {
  socket.on('disconnect', () => {
    console.log("Client disconnected");
  })

  socket.on("hello", () => {
    console.log("Client says hello");
  });

  console.log("connection!");
});

io.listen(5173);