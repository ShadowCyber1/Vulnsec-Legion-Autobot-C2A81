const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
	name: "spamkick",
	version: "1.0.0",
	permission: 2, // Adjust permission level as needed
	description: "Automatically kicks users who spam the group chat.",
	hasPrefix: false,
	usages: "",
	cooldown: 0,
};

module.exports.run = async function ({ api, event }) {
	const threadList = await api.getThreadList(100, null, ["INBOX"]);
	const spamThreshold = 8; // Number of messages to trigger kick
	const adminID = "your_admin_user_id_here"; // Replace with your admin's user ID
	let spammerProfile = {};

	const handleSpam = async (thread) => {
		try {
			await api.sendMessage(
				"Warning: You are spamming the group chat. This behavior is not allowed.",
				thread.threadID
			);
			if (!spammerProfile[thread.threadID]) {
				spammerProfile[thread.threadID] = {
					count: 1,
					spammingUser: event.senderID,
					groupInfo: thread.name,
				};
			} else {
				spammerProfile[thread.threadID].count++;
				if (spammerProfile[thread.threadID].count >= spamThreshold) {
					const spammer = await api.getUserInfo(spammerProfile[thread.threadID].spammingUser);
					await api.removeUserFromGroup(spammerProfile[thread.threadID].spammingUser, thread.threadID);
					await api.sendMessage(
						`User ${spammer[spammerProfile[thread.threadID].spammingUser].name} has been kicked for spamming.`,
						adminID
					);
					await api.sendMessage(
						`Profile: https://facebook.com/${spammer[spammerProfile[thread.threadID].spammingUser].vanity || spammerProfile[thread.threadID].spammingUser}`,
						adminID
					);
					await api.sendMessage(
						`Spamming in group: ${spammerProfile[thread.threadID].groupInfo}`,
						adminID
					);
					delete spammerProfile[thread.threadID];
				}
			}
		} catch (error) {
			console.error("Error handling spam:", error);
		}
	};

	for (const thread of threadList) {
		if (thread.isGroup && thread.name != thread.threadID && thread.threadID != event.threadID) {
			await handleSpam(thread);
		}
	}
};

