const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const path = require("path");

module.exports = function override(config, env) {
  const isEnvDevelopment = env === "development";

  if (isEnvDevelopment) {
    config.plugins = [
      ...config.plugins,
      isEnvDevelopment &&
        new WorkboxWebpackPlugin.InjectManifest({
          swSrc: path.resolve(__dirname, "src/service-worker.ts"),
          dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
          exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        }),
    ];
  }

  return config;
};
