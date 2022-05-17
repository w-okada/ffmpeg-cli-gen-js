import express from "express";
import livereload from "livereload"
import connectLiveReload from "connect-livereload"
import { hostname } from "os";

const liveReloadServer = livereload.createServer();
liveReloadServer.watch("frontend/dist")
liveReloadServer.server.once("connection", () => {
    console.log("CONNECTION")
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});

const port: number = Number(process.env.PORT) || 3000;
const watch = process.env.WATCH ? true : false
const app = express();
app.use(connectLiveReload());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

if (watch) {
    app.use('/frontend', express.static('frontend/dist/', {
        setHeaders: function (res, path) {
            // res.set("Cross-Origin-Resource-Policy", "cross-origin");
            // res.set("Cross-Origin-Opener-Policy", "same-origin");
            // res.set("Cross-Origin-Embedder-Policy", "require-corp");
        }
    }));

} else {
    app.use('/frontend', express.static('frontend/dist/', {
        setHeaders: function (res, path) {
            res.set("Cross-Origin-Opener-Policy", "same-origin");
            res.set("Cross-Origin-Embedder-Policy", "require-corp");
        }
    }));
}

app.listen(port, () => {
    console.log(`listening on *:${port}`);
})