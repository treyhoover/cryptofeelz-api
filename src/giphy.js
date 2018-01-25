const _ = require('lodash');
const { promisify } = require('util');
const fs = require("fs");
const mkdirp = promisify(require("mkdirp"));
const path = require("path");
const GphApiClient = require("giphy-js-sdk-core");
const download = require('image-downloader');

const API_KEY = "CHOO0Uw2ELi7jXsVIUednM1DpBGHByHh";
const giphy = GphApiClient(API_KEY);

const resolveGifDir = bucket => path.resolve("/", "gifs", bucket);

const resolveGif = (bucket, id) => {
  const targetDir = resolveGifDir(bucket);

  return path.resolve(targetDir, `${id}.gif`);
};

const downloadGif = async (bucket, gif) => {
  const gifPath = resolveGif(bucket, gif.id);
  const url = gif.images.downsized_medium.gif_url;

  if (!fs.existsSync(gifPath)) {
    await download.image({
      url,
      dest: gifPath,
    });
  }

  return gifPath;
};

// Fetches, downloads and returns the gif path on the server
const fetchGifForEmotion = async (emotion) => {
  // console.log("fetching gif for", emotion);
  const targetDir = resolveGifDir(emotion);

  // ensure the output directory exists for the gif before we download it
  await mkdirp(targetDir);

  const response = await giphy.search('gifs', { q: emotion });

  const gif = _.sample(response.data);

  return await downloadGif(emotion, gif);
};

module.exports = {
  default: giphy,
  fetchGifForEmotion,
};
