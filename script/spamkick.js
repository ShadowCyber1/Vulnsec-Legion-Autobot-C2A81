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
  description: `Toggle automatic kicking of users if they spam ${num} times/${timee}s on or off`,
  usePrefix: true,
  commandCategory: "System",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  // Toggle antispamEnabled variable
  antispamEnabled = !antispamEnabled;

  if (antispamEnabled) {
    return api.sendMessage(`✅ Spamkick has been turned on. Automatically kick users if they spam ${num} times/${timee}s`, threadID, messageID);
  } else {
    return api.sendMessage(`✅ Spamkick has been turned off.`, threadID, messageID);
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
            console.error(`Failed to remove user ${senderID} from thread ${threadID}:`, err);
          } else {
            // Mark user as banned and set ban reason and date
            data.banned = true;
            data.reason = `spam bot ${num} times/${timee}s` || null;
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
              `${senderID}\n⚡️Name: ${dataUser.name}\n⚡️Reason: spam bot ${num} times/${timee}s\n\n✔️User has been removed from the group`,
              threadID,
              () => {
                // Send message to admin bot(s) with details of the spam incident
                var idad = global.config.ADMINBOT;
                for (let ad of idad) {
                  api.sendMessage(
                    `⚡️Spam offenders ${num} times/${timee}s\n⚡️Name: ${dataUser.name}\n⚡️ID: ${senderID}\n⚡️ID Box: ${threadID}\n⚡️NameBox: ${namethread}\n⚡️Time: ${timeDate}`,
                    ad
                  );
                }
              }
            );
          }
        });
      } catch (err) {
        console.error(`Failed to process spam for user ${senderID} in thread ${threadID}:`, err);
      }
    }
  }
};
