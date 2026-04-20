function getConfig() {
  return {
    locales: ["en", "fr", "es", "yoruba", "igbo", "hausa"],
    defaultLocale: "en",
  };
}

// Support multiple import styles (CJS require, ESM default, named export)
module.exports = getConfig;
module.exports.default = getConfig;
module.exports.getConfig = getConfig;
