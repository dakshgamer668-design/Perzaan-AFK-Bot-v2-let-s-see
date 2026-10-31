const mineflayer = require('mineflayer');
const http = require('http');

// 1. DUMMY WEB SERVER: Keeps your cloud hosting platform alive
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Minecraft AFK Bot is running!");
    res.end();
}).listen(PORT, () => {
    console.log(`Web server listening on port ${PORT} for health checks.`);
});

// 2. BOT CONFIGURATION: Change these values to match your Aternos server
const botOptions = {
    host: 'SpiritualSmp.aternos.me', // Change to your actual Aternos IP
    port: 23676,                         // Change to your actual numerical port
    username: 'AternosAFKBot',           // The username for your bot
    version: false                       // Auto-detects server version (requires ViaVersion on server)
};

// 3. CORE BOT FUNCTION WITH AUTO-RECONNECT
function startBot() {
    console.log(`Attempting to connect to ${botOptions.host}:${botOptions.port}...`);
    const bot = mineflayer.createBot(botOptions);

    // Triggered when the bot successfully joins the server
    bot.on('spawn', () => {
        console.log(`${bot.username} has spawned in the server.`);
        
        // Anti-AFK Action: Move slightly every 30 seconds to prevent Aternos idle kicks
        const afkInterval = setInterval(() => {
            if (bot && bot.entity) {
                // Jump once
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
                
                // Swing arm
                bot.swingArm('right');
                
                console.log("Performed Anti-AFK action (jump/swing).");
            }
        }, 30000);

        // Clear the interval if the bot leaves the server
        bot.once('end', () => clearInterval(afkInterval));
    });

    // Handle normal server kicks or connection losses
    bot.on('end', (reason) => {
        console.log(`Bot disconnected. Reason: ${reason}. Retrying connection in 15 seconds...`);
        setTimeout(startBot, 15000);
    });

    // Prevent Node.js process crashes on unexpected socket errors
    bot.on('error', (err) => {
        console.error(`Socket Error: ${err.message}`);
    });

    // Log chat messages to console (helps you see if it gets kicked for spam/flying)
    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[Chat] ${username}: ${message}`);
    });
}

// Start the bot loop
startBot();

