const { sample } = require("lodash");

const findEmotions = percent => {
  const n = parseInt(percent, 10);

  if (n > 25) return ["rich", "making it rain"];
  if (n > 10) return ["party", "good job", "popcorn", "happy", "oh yeah"];
  if (n > 5) return ["k", "thumbs up", "yes"];
  if (n >= 0) return ["whatever", "eye roll", "bored", "shrug", "waiting", "tired"];

  if (n > -5) return ["no", "dislike", "shake head", "disappointed", "facepalm"];
  if (n > -10) return ["crying", "why"];

  return ["broke", "fml", "screaming"];
};

exports.percentToEmotion = p => {
  const emotions = findEmotions(p);

  return sample(emotions);
};
