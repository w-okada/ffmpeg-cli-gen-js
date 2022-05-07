/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require("path");

module.exports = {
    mode: "development",
    // mode: "production",
    entry: path.resolve(__dirname, "backend/src/index.ts"),
    output: {
        path: path.resolve(__dirname, "backend/dist"),
        filename: "index.js",
    },
    resolve: {
        // modules: [path.resolve(__dirname, "node_modules")],
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true,
                        configFile: path.resolve(__dirname, "backend/backend.tsconfig.json"),
                    },
                },
            },
        ],
    },
};
