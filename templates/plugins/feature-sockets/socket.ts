import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const initializeSockets = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 [Socket Connected]: ${socket.id}`);

    // Sample event listener
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket Disconnected]: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketInstance = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Ensure initializeSockets is called in server.ts.');
  }
  return io;
};