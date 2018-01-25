const _ = require('lodash');
const { promisify } = require('util');
const fs = require("fs");
const mkdirp = promisify(require("mkdirp"));
const readDir = promisify(fs.readdir);
const path = require("path");
const GphApiClient = require("giphy-js-sdk-core");
const download = require('image-downloader');

const DEFAULT_GIF_ROOT = path.join(process.cwd(), "gifs");

const { GIF_ROOT = DEFAULT_GIF_ROOT } = process.env;

const API_KEY = "CHOO0Uw2ELi7jXsVIUednM1DpBGHByHh";
const giphy = GphApiClient(API_KEY);

const resolveGifDir = bucket => path.resolve(GIF_ROOT, bucket);

const resolveGif = (bucket, id) => {
  const targetDir = resolveGifDir(bucket);

  return path.resolve(targetDir, `${id}.gif`);
};

const downloadGif = async (bucket, gif) => {
  const targetDir = resolveGifDir(bucket);
  const gifPath = resolveGif(bucket, gif.id);
  const url = gif.images.downsized_medium.gif_url;

  // ensure the output directory exists for the gif before we download it
  await mkdirp(targetDir);

  if (!fs.existsSync(gifPath)) {
    await download.image({
      url,
      dest: gifPath,
    });
  } else {
    console.log("using gif from cache", gifPath);
  }

  return gifPath;
};

const fetchGifs = async (q) => giphy.search('gifs', { q }).then(res => res.data);

// Find a random gif from the local gif bucket
const fetchGifForEmotion = async (emotion) => {
  const dir = resolveGifDir(emotion);
  // const gifs = await fetchGifs(emotion);
  // const gif = _.sample(gifs);

  // return await downloadGif(emotion, gif);

  const cachedGifs = await readDir(dir);
  const fileName = _.sample(cachedGifs);

  return path.resolve(GIF_ROOT, emotion, fileName);
};

module.exports = {
  default: giphy,
  fetchGifForEmotion,
  resolveGifDir,
  resolveGif,
  downloadGif,
  fetchGifs,
};
