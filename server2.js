const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");

const server = http.createServer();
const io = socketIo(server);

function generateHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

io.on("connection", (socket) => {
    console.log(`A Client ${socket.id} connected`);

    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
    });

    socket.on("message", (data) => {
        let { username, message, hash } = data;
        
        // Verifikasi integritas pesan dengan membandingkan hash
        const messageHash = generateHash(message);
        if (messageHash === hash) {
            console.log(`Message from ${username}: ${hash}`);
        } else {
            console.log(`Integrity check failed for message from ${username}`);
            message = "Message integrity compromised";
        }
        
        // Kirim pesan dengan hash untuk verifikasi ke klien lain
        io.emit("message", { username, message, hash: messageHash });
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
