const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto");

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

let username = "";

function generateHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

socket.on("connect", () => {
    console.log("Connected to the server");

    rl.question("Enter your username: ", (input) => {
        username = input;
        console.log(`Welcome, ${username} to the chat`);
        rl.prompt();

        rl.on("line", (message) => {
            if (message.trim()){
                // Hash pesan sebelum dikirim ke server
                const hash = generateHash(message);
                socket.emit("message", { username, message, hash });
            }
            rl.prompt();
        });
    });
});

socket.on("message", (data) => {
    const { username: senderUsername, message: senderMessage, hash: senderHash } = data;

    // Verifikasi integritas pesan yang diterima
    const messageHash = generateHash(senderMessage);

    if (messageHash === senderHash) {
        console.log(`${senderUsername}: ${senderMessage}`);
    } else {
        console.log(`Message integrity compromised from ${senderUsername}`);
    }
    rl.prompt();
});

socket.on("disconnect", () => {
    console.log("Server disconnected, Exiting....");
    rl.close();
    process.exit(0);
});

rl.on("SIGINT", () => {
    console.log("\nExiting");
    socket.disconnect();
    rl.close();
    process.exit(0);
});
