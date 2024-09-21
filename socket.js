const { Server } = require('socket.io');

let io; // This will hold the Socket.IO instance

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        },
    });
};

const getSocket = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getSocket,
};
