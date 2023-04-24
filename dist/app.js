"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const log4js_1 = __importDefault(require("log4js"));
const dotenv_1 = require("dotenv");
const stream_1 = require("stream");
const automate_1 = require("./automate");
(0, dotenv_1.config)();
const errorRestartEmitter = new stream_1.EventEmitter();
log4js_1.default.configure({
    appenders: { log: { type: "file", filename: "run.log" } },
    categories: { default: { appenders: ["log"], level: "all" } },
});
const logger = log4js_1.default.getLogger("log");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield playwright_1.webkit.launch({
        headless: process.env.NODE_ENV === "production" ? true : false,
    });
    logger.info("Opened a browser");
    errorRestartEmitter.once("error", () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info("Restarting for an error");
        run();
        yield browser.close();
    }));
    for (let i = 0; i < 4; i++) {
        (0, automate_1.automate)(browser);
    }
});
console.log("Starting an automation", new Date().toLocaleString());
run();
process.on("uncaughtException", (error) => {
    errorRestartEmitter.emit("error");
    console.log(error);
    logger.error(`${error.name} - ${error.message}`);
});
