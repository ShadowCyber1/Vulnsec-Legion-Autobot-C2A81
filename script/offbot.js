module.exports.config = {
    name: "offbot",
    version: "1.1.0",
    role: 2,
    credits: "yukihirasoma",
    description: "Turn off the bot",
    usePrefix: true,
    commandCategory: "system",
    cooldowns: 2,
};

module.exports.run = ({ event, api }) => {
    api.sendMessage("The bot is now turning off.", event.threadID, () => process.exit(0));
};
