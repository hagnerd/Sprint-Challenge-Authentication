function secret() {
  return process.env.SECRET || "supersecret";
}

module.exports = secret;
