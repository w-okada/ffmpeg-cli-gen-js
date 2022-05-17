"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const livereload_1 = __importDefault(require("livereload"));
const connect_livereload_1 = __importDefault(require("connect-livereload"));
const liveReloadServer = livereload_1.default.createServer();
liveReloadServer.watch("frontend/dist");
liveReloadServer.server.once("connection", () => {
    console.log("CONNECTION");
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});
const port = Number(process.env.PORT) || 3000;
const watch = process.env.WATCH ? true : false;
const app = (0, express_1.default)();
app.use((0, connect_livereload_1.default)());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
if (watch) {
    app.use('/frontend', express_1.default.static('frontend/dist/', {
        setHeaders: function (res, path) {
            // res.set("Cross-Origin-Resource-Policy", "cross-origin");
            // res.set("Cross-Origin-Opener-Policy", "same-origin");
            // res.set("Cross-Origin-Embedder-Policy", "require-corp");
        }
    }));
}
else {
    app.use('/frontend', express_1.default.static('frontend/dist/', {
        setHeaders: function (res, path) {
            res.set("Cross-Origin-Opener-Policy", "same-origin");
            res.set("Cross-Origin-Embedder-Policy", "require-corp");
        }
    }));
}
app.listen(port, () => {
    console.log(`listening on *:${port}`);
});
