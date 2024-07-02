module.exports.config = {
    name: "offbot",
    version: "1.1.0",
    role: 2, // Indicates this command requires admin privileges
    credits: "yukihirasoma",
    description: "Turn off the bot",
    usePrefix: true,
    commandCategory: "system",
    cooldowns: 2,
};

module.exports.run = async ({ event, api, Users }) => {
    const userID = event.senderID;
    const userInfo = await Users.getData(userID);

    // Check if the user has admin privileges
    if (!userInfo || userInfo.role < 2) {
        return api.sendMessage("You do not have permission to use this command.", event.threadID);
    }

    api.sendMessage("The bot is now turning off.", event.threadID, () => process.exit(0));
};
