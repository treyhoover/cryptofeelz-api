const { promisify } = require('util');
const redis = require("redis");

const {
  REDIS_HOST,
  REDIS_PORT,
} = process.env;

const cache = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

cache.get = promisify(cache.get).bind(cache);

module.exports = cache;
