"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const port = Number(process.env.PORT) || 3000;
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/frontend', express_1.default.static('frontend/dist/', {
    setHeaders: function (res, path) {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
        res.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.set("X-Powered-By", ' 3.2.1');
    }
}));
app.listen(port, () => {
    console.log(`listening on *:${port}`);
});
