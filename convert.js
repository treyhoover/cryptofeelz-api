const { promisify } = require('util');
const im = require('imagemagick');
const convert = promisify(im.convert);
const sizeOf = promisify(require('image-size'));
const rm = promisify(require('rimraf'));

const NEW_LINE_HACK = `\u200A\n`;

async function createGif(o) {
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
}

const symbol = "BTC";
const percentChange = 10;
const time = "24 hours";
const upOrDown = percentChange >= 0 ? "up" : "down";
const color = upOrDown === "up" ? "green" : "red";

createGif({
  text: `When ${symbol} is ${upOrDown} <span foreground="${color}" font_weight="bold">${percentChange}%</span> in the past ${time}...`,
  src: "input.gif",
  outputFile: "output.gif",
  tmpTextOverlay: "overlay.png",
  fontSize: 72,
  strokeWidth: 2,
}).catch(console.error);
