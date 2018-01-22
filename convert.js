const { promisify } = require('util');
const im = require('imagemagick');
const convert = promisify(im.convert);
const rm = promisify(require('rimraf'));

const text = "Hello world!!";

const bgGif = "giphy.gif";
const outputFile = "output.gif";
const tmpTextOverlay = "overlay.png";

const fontSize = 72;
const strokeWidth = 2;

(async function () {
  await convert(["-size", "400x100", "xc:transparent", "-font", "Arial", "-pointsize", fontSize, "-fill", "black", "-stroke", "white", "-strokewidth", strokeWidth, "-gravity", "center", "-draw", `text 0,0 '${text}'`, tmpTextOverlay]);
  await convert([bgGif, 'null:', '-gravity', 'north', tmpTextOverlay, '-layers', 'composite', outputFile]);
  await rm(tmpTextOverlay);
})();
