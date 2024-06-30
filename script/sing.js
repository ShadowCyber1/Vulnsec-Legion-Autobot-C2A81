const fs = require('fs-extra');
const ytdl = require('ytdl-core');
const yts = require("yt-search");

const config = {
    name: "sing",
    version: "2.0.4",
    role: 0,
    credits: "Yan Maglinte, Grey",
    description: "Play music via YouTube link or search keyword",
    usePrefix: true,
    commandCategory: "Means",
    usages: "[searchMusic]",
    cooldowns: 0
};

const downloadMusicFromYoutube = async (link, path) => {
    try {
        const timestart = Date.now();
        const data = await ytdl.getInfo(link);
        const result = {
            title: data.videoDetails.title,
            dur: Number(data.videoDetails.lengthSeconds),
            viewCount: data.videoDetails.viewCount,
            likes: data.videoDetails.likes,
            author: data.videoDetails.author.name,
            timestart: timestart
        };
        return new Promise((resolve, reject) => {
            ytdl(link, { filter: "audioonly" })
                .pipe(fs.createWriteStream(path))
                .on('finish', () => {
                    resolve({ data: path, info: result });
                });
        });
    } catch (e) {
        console.log(e);
    }
};

const run = async function ({ api, event, args }) {
    if (!args.length) return api.sendMessage('❯ Search cannot be empty!', event.threadID, event.messageID);

    const keywordSearch = args.join(" ");
    const path = `${__dirname}/cache/sing-${event.senderID}.mp3`;

    if (args[0].startsWith("https://")) {
        try {
            const { data, info } = await downloadMusicFromYoutube(args[0], path);
            const body = `🎵 Title: ${info.title}\n⏱️ Time: ${convertHMS(info.dur)}\n⏱️ Processing time: ${Math.floor((Date.now() - info.timestart) / 1000)} seconds`;

            if (fs.statSync(data).size > 26214400) {
                return api.sendMessage('⚠️The file could not be sent because it is larger than 25MB.', event.threadID, () => fs.unlinkSync(data), event.messageID);
            }

            return api.sendMessage({ body, attachment: fs.createReadStream(data) }, event.threadID, () => fs.unlinkSync(data), event.messageID);
        } catch (e) {
            console.log(e);
        }
    } else {
        try {
            const searchResults = await yts(keywordSearch);
            const video = searchResults.videos[0];
            if (!video) {
                return api.sendMessage('⚠️No results found.', event.threadID, event.messageID);
            }

            const videoUrl = video.url;
            const { data, info } = await downloadMusicFromYoutube(videoUrl, path);
            const body = `🎵 Title: ${info.title}\n⏱️ Time: ${convertHMS(info.dur)}\n⏱️ Processing time: ${Math.floor((Date.now() - info.timestart) / 1000)} seconds`;

            if (fs.statSync(data).size > 26214400) {
                return api.sendMessage('⚠️The file could not be sent because it is larger than 25MB.', event.threadID, () => fs.unlinkSync(data), event.messageID);
            }

            return api.sendMessage({ body, attachment: fs.createReadStream(data) }, event.threadID, () => fs.unlinkSync(data), event.messageID);
        } catch (e) {
            console.log(e);
        }
    }
};

module.exports = { config, run };

const convertHMS = (value) => new Date(value * 1000).toISOString().slice(11, 19);
