const axios = require('axios');

module.exports.config = {
  name: 'ai',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gpt', 'openai'],
  description: "An AI command powered by GPT-4",
  usage: "Ai [prompt]",
  credits: '𝗮𝗲𝘀𝘁𝗵𝗲𝗿',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');
  if (!input) {
    api.sendMessage(`♡   ∩_∩\n    （„• ֊ •„)♡\n┏━∪∪━━━━ღ❦ღ┓`, event.threadID, event.messageID);
    return;
  }

  try {
    const { data } = await axios.get(`https://nash-api-end-5swp.onrender.com/gpt4?query=${encodeURIComponent(input)}`);
    const response = data.response;
    if (!response) {
      api.sendMessage('The AI could not generate a response. Please try again.', event.threadID, event.messageID);
      return;
    }
    api.sendMessage(`♡   ∩_∩\n    （„• ֊ •„)♡\n┏━∪∪━━━━ღ❦ღ┓\n🌐 [${response}] ♡\n♡   Vulnsec-[📩]\n┗ღ❦ღ━━━━━━━┛\n[✦]|𝗚𝗣𝗧-𝟰`, event.threadID, event.messageID);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    api.sendMessage('An error occurred while processing your request. Please try again later.', event.threadID, event.messageID);
  }
};
