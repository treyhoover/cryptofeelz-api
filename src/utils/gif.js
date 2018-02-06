const { promisify } = require('util');
const fs = require("fs");
const download = require('image-downloader');
const im = require('imagemagick');
const convert = promisify(im.convert);
const sizeOf = promisify(require('image-size'));
const rm = promisify(require('rimraf'));

const NEW_LINE_HACK = `\u200A\n`;

const createGif = async function(o) {
  // get image size
  const { width } = await sizeOf(o.src);

  // create the text overlay
  await convert([
    "-size", `${width}x`,
    "-background", "black",
    "-font", "Arial",
    "-pointsize", "16",
    "-fill", "white",
    "-gravity", "center",
    `pango:${NEW_LINE_HACK + o.text + NEW_LINE_HACK}`,
    o.tmpTextOverlay,
  ]);

  const { height: captionHeight } = await sizeOf(o.tmpTextOverlay);

  // create gif composite (output)
  await convert([
    o.src,
    'null:',
    "-splice", `0x${captionHeight}`,
    '-gravity', 'north',
    o.tmpTextOverlay,
    '-layers', 'composite',

    o.outputFile
  ]);

  // remove the text overlay
  await rm(o.tmpTextOverlay);
};

const feel2Gif = async (feel) => {
  const inputFilePath = `/tmp/${feel.gif}.gif`;
  const captionFilePath = `/tmp/${feel.caption}.png`;
  const outputFilePath = `/tmp/${feel.id}_output.gif`;

  if (!fs.existsSync(inputFilePath)) {
    await download.image({
      url: `https://media1.giphy.com/media/${feel.gif}/200.gif`,
      dest: inputFilePath,
    });
  }

  if (!fs.existsSync(outputFilePath)) {
    await(createGif({
      src: inputFilePath,
      text: feel.captionMarkup,
      tmpTextOverlay: captionFilePath,
      outputFile: outputFilePath,
    }));
  }

  return outputFilePath;
};

module.exports = {
  createGif,
  feel2Gif,
};
