const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions"); // Import action constants

const server = http.createServer(app); // Create HTTP server

const io = new Server(server); // Initialize Socket.IO server

const userSocketMap = {}; // Map to track socketId to username mappings

// Function to get all connected clients in a room
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  // Handle new connection
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username; // Map socketId to username
    socket.join(roomId); // Join the specified room
    const clients = getAllConnectedClients(roomId); // Get all clients in the room
    // Notify existing clients about the new user
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // Sync code changes
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code }); // Broadcast code change to all clients in the room except sender
  });

  // Sync initial code to new user joining
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code }); // Send current code to new user joining
  });

  // Handle disconnection
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms]; // Get all rooms the socket is in
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, { // Notify all clients in each room about disconnection
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id]; // Remove socketId from userSocketMap
    socket.leave(); // Leave all rooms
  });
});

const PORT = process.env.PORT || 5000; // Set server port
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`)); // Start server
