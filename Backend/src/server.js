import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { users } from "./userRegistry.js";
import { markActive, startPresenceEngine } from "./presence.js";
import { onStrokeCommit, onUndo, onRedo, getSnapshot } from "./opLog.js";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", socket => {
  const user = {
    socketId: socket.id,
    userId: uuid(),
    name: `User-${socket.id.slice(0,4)}`,
    drawingColor: randomColor(),
    lastActive: Date.now()
  };

  users.set(socket.id, user);

  socket.emit("self:init", user);
  socket.emit("canvas:snapshot", getSnapshot());
  io.emit("users:update", [...users.values()]);

  socket.on("stroke:start", data => {
  socket.broadcast.emit("stroke:start", data);
});

socket.on("stroke:move", data => {
  socket.broadcast.emit("stroke:move", data);
});


//   // LIVE DRAWING
//   socket.on("stroke:move", data => {
//     socket.broadcast.emit("stroke:move", data);
//   });

  // FINAL COMMIT
  socket.on("stroke:end", op => {
    markActive(socket.id);
    onStrokeCommit(op, io);
  });

  socket.on("undo", () => onUndo(io));
  socket.on("redo", () => onRedo(io));

  socket.on("cursor", pos => {
    socket.broadcast.emit("cursor:update", {
      userId: user.userId,
      ...pos
    });
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.emit("users:update", [...users.values()]);
  });
});

startPresenceEngine(io);
server.listen(3000, () => console.log("Server running"));

function randomColor() {
  return ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6"]
    [Math.floor(Math.random()*5)];
}

export { app };