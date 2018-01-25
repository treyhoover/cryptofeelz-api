const { sample, flatten } = require("lodash");

const percentEmotionMap = {
  "-25": ["broke", "fml", "screaming"],
  "-10": ["crying", "why"],
  "-5": ["no", "dislike", "shake head", "disappointed", "facepalm"],
  "0": ["whatever", "eye roll", "bored", "shrug", "waiting", "tired"],
  "5": ["k", "thumbs up", "yes"],
  "10": ["party", "good job", "popcorn", "happy", "oh yeah"],
  "25": ["rich", "making it rain"],
};

const percentBuckets = Object.keys(percentEmotionMap)
  .map(Number)
  .filter(x => x >= 0) // ignore sign for buckets
  .sort((a, b) => b - a); // reverse so we can find the largest bucket (without going over)

exports.emotions = flatten(Object.values(percentEmotionMap));

exports.percentToEmotion = p => {
  const absChange = Math.abs(p);
  let bucket = String(percentBuckets.find(p => absChange > p));

  if (p < 0 && bucket !== "0") {
    bucket = "-" + bucket;
  }

  return sample(percentEmotionMap[bucket]);
};
