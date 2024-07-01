const { exec } = require('child_process');

module.exports.config = {
    name: "onbot",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "yukihirasoma",
    description: "Turn on the bot",
    usePrefix: true,
    commandCategory: "system",
    cooldowns: 2,
};

module.exports.run = ({ event, api }) => {
    api.sendMessage("The bot is now turning on.", event.threadID, () => {
        exec('pm2 start bot', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error turning on the bot: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error turning on the bot: ${stderr}`);
                return;
            }
            console.log(`Bot on: ${stdout}`);
        });
    });
};
