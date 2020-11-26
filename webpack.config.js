const path = require('path');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const distPath = path.resolve(__dirname, "dist");
module.exports = (env, argv) => {
  return {
    devServer: {
      contentBase: distPath,
      compress: argv.mode === 'production',
      port: 8000
    },
    entry: './bootstrap.js',
    output: {
      path: distPath,
      filename: "helloworld.js",
      webassemblyModuleFilename: "helloworld.wasm"
    },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: './static', to: distPath },
        {
          from: './static/manifest.json',
          to: distPath,
          transform: (content) => {
            const jsonContent = JSON.parse(content);

            // This is needed in development because of the Content Security Policy of the browser:
            // https://stackoverflow.com/questions/59207838/refused-to-load-the-script-because-it-violates-the-following-content-security-po/59213413#59213413
            jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";

            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ]),
      new WasmPackPlugin({
        crateDirectory: ".",
        extraArgs: "--no-typescript",
      })
    ],
    watch: argv.mode !== 'production'
  };
};
