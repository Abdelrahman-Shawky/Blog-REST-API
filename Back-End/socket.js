const { createServer } = require('http');
const { Server } = require('socket.io');

let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            allowEIO3: true,
            cors:{
                origin: '*',
                methods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
                credentials: true
             }
        });
        return io;
    },
    getIO: () => {
        if(!io){
            throw new Error('Socket.io not initialized')
        }
        return io;
    }
};