const mineflayer = require('mineflayer');
const express = require('express');

// ১. Express Web Server (Render-কে সচল রাখার জন্য)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Minecraft AFK Bot active 24/7');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// ২. Bot configuration
const botOptions = {
    host: process.env.MC_HOST || 'your-server-ip.com', // Render-এ হোস্ট না দিলে এটি ব্যবহার হবে
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.MC_USERNAME || 'FarmBot_AFK'
};

let bot;

function createBot() {
    bot = mineflayer.createBot(botOptions);

    bot.on('spawn', () => {
        console.log(`[+] Bot joined as ${bot.username}`);
        startActions();
    });

    bot.on('kicked', (reason) => {
        console.log(`[-] Kicked: ${reason}`);
        reconnect();
    });

    bot.on('end', (reason) => {
        console.log(`[-] Disconnected: ${reason}`);
        reconnect();
    });

    bot.on('error', (err) => {
        console.log(`[!] Error: ${err.message}`);
    });
}

let swingInterval = null;
let afkInterval = null;

function startActions() {
    if (swingInterval) clearInterval(swingInterval);
    if (afkInterval) clearInterval(afkInterval);

    // প্রতি ১ সেকেন্ড পরপর হাত নাড়ানো (Attack/Swing)
    swingInterval = setInterval(() => {
        if (!bot) return;
        try {
            bot.swingArm('right');
        } catch (e) {}
    }, 1000);

    // প্রতি ৩০ সেকেন্ডে হালকা মাথা ঘোরানো (Anti-AFK)
    afkInterval = setInterval(() => {
        if (!bot) return;
        try {
            const yaw = bot.entity.yaw + (Math.random() - 0.5) * 0.4;
            const pitch = Math.max(-1.5, Math.min(1.5, bot.entity.pitch + (Math.random() - 0.5) * 0.2));
            bot.look(yaw, pitch, true);
        } catch (e) {}
    }, 30000);
}

function reconnect() {
    console.log('[*] Reconnecting in 10 seconds...');
    if (swingInterval) clearInterval(swingInterval);
    if (afkInterval) clearInterval(afkInterval);

    setTimeout(() => {
        createBot();
    }, 10000);
}

createBot();
