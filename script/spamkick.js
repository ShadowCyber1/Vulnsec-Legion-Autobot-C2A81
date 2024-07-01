const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require("moment-timezone");

let antispamEnabled = true; // Initialize antispamEnabled flag to true (enabled by default)

const num = 8; // Number of times spam gets banned - 1
const timee = 120; // During timee seconds, spam num times will be banned

module.exports.config = {
  name: "spamkick",
  version: "1.0.0",
  hasPermission: 2, // Updated permission level to match sendnoti
  credits: "VulnSec Legion",
  description: Toggle automatic kicking of users if they spam ${num} times/${timee}s on or off,
  usePrefix: true,
  commandCategory: "System",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;

  // Check if the user has the required permission level
  const userInfo = await Users.getData(senderID);
  if (userInfo.role < 2) {
    return api.sendMessage("⚠️ You do not have permission to use this command.", threadID, messageID);
  }

  // Toggle antispamEnabled variable
  antispamEnabled = !antispamEnabled;

  if (antispamEnabled) {
    return api.sendMessage(✅ Spamkick has been turned on. Automatically kick users if they spam ${num} times/${timee}s, threadID, messageID);
  } else {
    return api.sendMessage(✅ Spamkick has been turned off., threadID, messageID);
  }
};

module.exports.handleEvent = async function ({ Users, Threads, api, event }) {
  if (!antispamEnabled) return; // Check if antispam is enabled, if not, return immediately

  let { senderID, threadID, body } = event;

  // Check if antispam data exists for senderID, initialize if not
  if (!global.client.antispam) global.client.antispam = {};
  if (!global.client.antispam[senderID]) {
    global.client.antispam[senderID] = {
      timeStart: Date.now(),
      messages: [],
    };
  }

  const threadSetting = global.data.threadData.get(threadID) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  // Ignore messages starting with bot prefix or without body
  if (!body || body.indexOf(prefix) === 0) return;

  const currentTime = Date.now();
  global.client.antispam[senderID].messages.push({ body, time: currentTime });

  // Clean up old messages
  global.client.antispam[senderID].messages = global.client.antispam[senderID].messages.filter(
    (msg) => currentTime - msg.time <= timee * 1000
  );

  // Check if user reached spam limit
  if (global.client.antispam[senderID].messages.length >= num) {
    // Check for repeated messages
    const messageCount = global.client.antispam[senderID].messages.reduce((count, msg) => {
      count[msg.body] = (count[msg.body] || 0) + 1;
      return count;
    }, {});

    const isSpam = Object.values(messageCount).some((count) => count >= num);

    if (isSpam) {
      try {
        // Retrieve thread information
        const datathread = (await Threads.getData(threadID)).threadInfo;
        const namethread = datathread.threadName;

        // Get current timestamp in desired format
        const timeDate = moment.tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss");

        // Retrieve user data
        let dataUser = await Users.getData(senderID) || {};
        let data = dataUser.data || {};

        // Ensure user is not already banned
        if (data && data.banned === true) return;

        // Kick the user from the group chat
        api.removeUserFromGroup(senderID, threadID, async (err) => {
          if (err) {
            console.error(Failed to remove user ${senderID} from thread ${threadID}:, err);
          } else {
            // Mark user as banned and set ban reason and date
            data.banned = true;
            data.reason = spam bot ${num} times/${timee}s || null;
            data.dateAdded = timeDate;

            // Update user data
            await Users.setData(senderID, { data });
            global.data.userBanned.set(senderID, { reason: data.reason, dateAdded: data.dateAdded });

            // Clear antispam data for user
            global.client.antispam[senderID] = {
              timeStart: Date.now(),
              messages: [],
            };

            // Send message to thread indicating user has been kicked
            api.sendMessage(
              ${senderID}\n⚡️Name: ${dataUser.name}\n⚡️Reason: spam bot ${num} times/${timee}s\n\n✔️User has been removed from the group,
              threadID,
              () => {
                // Send message to admin bot(s) with details of the spam incident
                var idad = global.config.ADMINBOT;
                for (let ad of idad) {
                  api.sendMessage(
                    ⚡️Spam offenders ${num} times/${timee}s\n⚡️Name: ${dataUser.name}\n⚡️ID: ${senderID}\n⚡️ID Box: ${threadID}\n⚡️NameBox: ${namethread}\n⚡️Time: ${timeDate},
                    ad
                  );
                }
              }
            );
          }
        });
      } catch (err) {
        console.error(Failed to process spam for user ${senderID} in thread ${threadID}:, err);
      }
    }
  }
};
same function on permission on this script const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
	name: "sendnoti",
	version: "1.1.0",
	role: 2,
	description: "Sends a message to all groups and can only be done by the admin.",
	hasPrefix: false,
	aliases: ["noti"],
	usages: "[Text]",
	cooldown: 0,
};

module.exports.run = async function ({ api, event, args, admin }) {
	const threadList = await api.getThreadList(100, null, ["INBOX"]);
	let sentCount = 0;
	const custom = args.join(" ");

	async function sendMessage(thread) {
		try {
			await api.sendMessage(
𝙉𝙊𝙏𝙄𝙁𝙄𝘾𝘼𝙏𝙄𝙊𝙉 - 𝘼𝘿𝙈𝙄𝙉\n-----------------------\n🌐 [${custom}]\n-----------------------\n〉「𝙰𝙽𝙾𝙽𝚈𝙼𝙾𝚄𝚂」,
				thread.threadID
			);
			sentCount++;

			const content = ${custom};
			const languageToSay = "fr"; 
			const pathFemale = path.resolve(__dirname, "cache", ${thread.threadID}_female.mp3);

			await downloadFile(
				https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(content)}&tl=${languageToSay}&client=tw-ob&idx=1,
				pathFemale
			);
			api.sendMessage(
				{ attachment: fs.createReadStream(pathFemale) },
				thread.threadID,
				() => fs.unlinkSync(pathFemale)
			);
		} catch (error) {
			console.error("Error sending a message:", error);
		}
	}

	for (const thread of threadList) {
		if (sentCount >= 20) {
			break;
		}
		if (thread.isGroup && thread.name != thread.threadID && thread.threadID != event.threadID) {
			await sendMessage(thread);
		}
	}

	if (sentCount > 0) {
		api.sendMessage(› Sent the notification successfully., event.threadID);
	} else {
		api.sendMessage(
			"› No eligible group threads found to send the message to.",
			event.threadID
		);
	}
};

async function downloadFile(url, filePath) {
	const writer = fs.createWriteStream(filePath);
	const response = await axios({
		url,
		method: 'GET',
		responseType: 'stream'
	});
	response.data.pipe(writer);
	return new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});
}
