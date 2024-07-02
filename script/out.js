module.exports.config = {
    name: "out",
    version: "1.1.0",
    role: 2,
    credits: "Kanichi",
    description: "Leave the group",
    usePrefix: true,
    commandCategory: "Admin",
    usages: "out [id]",
    cooldowns: 2,
};

module.exports.run = async function({ api, event, args, Users }) {
    const userID = event.senderID;
    const userInfo = await Users.getData(userID);

    // Check if the user has admin privileges
    if (!userInfo || userInfo.role < 2) {
        return api.sendMessage("You do not have permission to use this command.", event.threadID);
    }

    if (!args[0]) {
        return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
    }
    if (!isNaN(args[0])) {
        return api.removeUserFromGroup(api.getCurrentUserID(), args.join(" "));
    }

    return api.sendMessage("Invalid command usage.", event.threadID);
};
