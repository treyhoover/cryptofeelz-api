const roundDate = (date = new Date(), minutes = 0) => {
  if (minutes <= 0) return date;

  const ms = minutes * 60 * 1000; // minutes in milliseconds

  return new Date(Math.round(date.getTime() / ms) * ms);
};

const createRounder = (minutes) => (date) => roundDate(date, minutes);

module.exports = {
  createRounder,
  roundDate,
};
