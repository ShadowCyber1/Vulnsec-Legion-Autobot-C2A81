const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

let spamkickState = {};
let spamCount = {};

const admins = JSON.parse(fs.readFileSync(path.resolve(__dirname, "admin.json")));

module.exports.config = {
    name: "spamkick",
    role: 2,
    credits: "Deku",
    description: "Toggles the spamkick function and kicks users after spamming 8 times.",
    usages: "[userID reason]",
    hasPrefix: false,
    cooldown: 0,
    aliases: ["skick"]
};

module.exports.run = async function ({ api, event, args }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const userID = args[0];
    const reason = args.slice(1).join(" ") || "No reason provided";
    const timeStamp = new Date().toLocaleString();

    const reply = (msg) => api.sendMessage(msg, threadID, event.messageID);

    if (!admins.includes(senderID)) {
        return reply("Only admins can use this command.");
    }

    if (spamkickState[threadID]) {
        spamkickState[threadID] = false;
        return reply("🚫 Spamkick has been turned off.");
    } else {
        spamkickState[threadID] = true;
        return reply("✅ Spamkick has been turned on.");
    }
};

module.exports.handleMessage = async function ({ api, event }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    if (!spamkickState[threadID]) return;

    // Initialize spam count for the thread if it doesn't exist
    if (!spamCount[threadID]) {
        spamCount[threadID] = {};
    }

    // Initialize spam count for the user if it doesn't exist
    if (!spamCount[threadID][senderID]) {
        spamCount[threadID][senderID] = 0;
    }

    // Increment spam count
    spamCount[threadID][senderID] += 1;

    if (spamCount[threadID][senderID] >= 8) {
        try {
            await api.removeUserFromGroup(senderID, threadID);
            api.sendMessage(`User with ID ${senderID} has been kicked for spamming. Reason: Spamming 8 times`, threadID);

            const adminMessage = `
                🛑 Spamkick Notification 🛑
                User with ID ${senderID} has been kicked for spamming 8 times.
                Time: ${new Date().toLocaleString()}
                Group: ${threadID}
            `;
            admins.forEach(adminID => {
                api.sendMessage(adminMessage, adminID);
            });

            // Reset the spam count for the user
            spamCount[threadID][senderID] = 0;
        } catch (error) {
            console.error("Error kicking the user:", error);
            api.sendMessage("An error occurred while trying to kick the user.", threadID);
        }
    }
};
