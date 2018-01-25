const { fetchGifs, downloadGif } = require("../src/giphy");
const { emotions } = require("../src/utils/emotions");

emotions.forEach(async (emotion) => {
  try {
    const gifs = await fetchGifs(emotion);

    gifs.forEach(gif => {
      downloadGif(emotion, gif);
    });

  } catch (e) {
    console.error(e);
  }
});

console.log("done!");