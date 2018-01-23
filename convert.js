const { promisify } = require('util');
const im = require('imagemagick');
const convert = promisify(im.convert);
const sizeOf = promisify(require('image-size'));
const rm = promisify(require('rimraf'));

async function createGif(o) {
  // get image size
  const { width, height } = await sizeOf(o.src);

  // create the text overlay
  await convert([
    "-size", `${width}x${height}`,
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
    o.src,
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
  src: "input.gif",
  outputFile: "output.gif",
  tmpTextOverlay: "overlay.png",
  fontSize: 72,
  strokeWidth: 2,
}).catch(console.error);
