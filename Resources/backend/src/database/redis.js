const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL || {
  host: "127.0.0.1",
  port: 6379,
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redisClient;