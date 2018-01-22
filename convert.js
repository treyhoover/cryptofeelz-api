const { promisify } = require('util');
const im = require('imagemagick');
const convert = promisify(im.convert);
const rm = promisify(require('rimraf'));

async function createGif(o) {
  // create the text overlay
  await convert([
    "-size", `${o.width}x100`,
    "xc:transparent",
    "-font", "Arial",
    "-pointsize", o.fontSize,
    "-fill", "black",
    "-stroke", "white",
    "-strokewidth", o.strokeWidth,
    "-gravity", "center",
    "-draw", `text 0,0 '${o.text}'`,
    o.tmpTextOverlay
  ]);

  // create gif composite (output)
  await convert([
    o.bgGif,
    'null:',
    '-gravity', 'north',
    o.tmpTextOverlay,
    '-layers', 'composite', o.outputFile
  ]);

  // remove the text overlay
  await rm(o.tmpTextOverlay);
}

createGif({
  text: "Hello world!!",
  bgGif: "giphy.gif",
  outputFile: "output.gif",
  tmpTextOverlay: "overlay.png",
  fontSize: 72,
  strokeWidth: 2,
  width: 400,
}).catch(console.error);
