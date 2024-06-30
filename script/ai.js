const axios = require("axios");

module.exports.config = {
    name: "ai",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "VulnSec Legion",
    description: "AI GPT-4 integration",
    commandCategory: "ai",
    usages: "[query]",
    usePrefix: true, // Using prefix defined in configuration
    cooldowns: 2,
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = encodeURIComponent(args.join(" "));

    if (!query) {
        return api.sendMessage("Please provide a message for the AI.", threadID, messageID);
    }

    try {
        // Set searching reaction and message
        api.setMessageReaction("🔍", messageID, (err) => {}, true);
        api.sendMessage("🤖 AI is searching for an answer, please wait...", threadID, messageID);

        const res = await axios.get(`https://nash-api-end-5swp.onrender.com/gpt4?query=${query}`);

        // Log the entire response to inspect its structure
        console.log("Full response:", JSON.stringify(res.data, null, 2));

        // Extracting the response message from the API response
        const respond = res.data.respond;

        if (!respond || typeof respond !== "string") {
            // Set failure reaction and send message
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            api.sendMessage("Could not find a valid response from the AI or the response format is incorrect.", threadID, messageID);
        } else {
            // Set success reaction and send message with answer
            api.setMessageReaction("✅", messageID, (err) => {}, true);
            api.sendMessage(`🖇 Answer: ${respond}`, threadID, messageID);
        }
    } catch (error) {
        console.error("Error fetching AI response:", error);
        // Set error reaction and send error message
        api.setMessageReaction("❌", messageID, (err) => {}, true);
        api.sendMessage("An error occurred while fetching the AI response. Please try again later.", threadID, messageID);
    }
};
