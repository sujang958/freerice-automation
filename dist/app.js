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
(0, dotenv_1.config)();
const errorRestartEmitter = new stream_1.EventEmitter();
log4js_1.default.configure({
    appenders: { log: { type: "file", filename: "run.log" } },
    categories: { default: { appenders: ["log"], level: "all" } },
});
const logger = log4js_1.default.getLogger("log");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const browser = yield playwright_1.webkit.launch({
        headless: process.env.NODE_ENV === "production" ? true : false,
    });
    const page = yield browser.newPage({ ignoreHTTPSErrors: true });
    errorRestartEmitter.once("error", () => __awaiter(void 0, void 0, void 0, function* () {
        yield browser.close();
        run();
        logger.info("Restarted for error");
    }));
    yield page.goto("https://freerice.com/profile-login");
    yield page.waitForLoadState("domcontentloaded");
    yield Promise.all([
        page.waitForSelector("#login-username"),
        page.waitForSelector("#login-password"),
    ]);
    yield page.type("#login-username", (_a = process.env.USER_NAME) !== null && _a !== void 0 ? _a : "");
    yield page.fill("#login-password", (_b = process.env.USER_PW) !== null && _b !== void 0 ? _b : "");
    yield page.click("#root > section > div > div:nth-child(1) > div > div.page__body > div > div > div:nth-child(5) > button");
    yield page.waitForSelector(`text=${process.env.USER_NAME}`);
    yield page.waitForTimeout(1000); // For safety
    logger.info(`Logined as ${process.env.USER_NAME}`);
    yield page.goto("https://freerice.com/categories/english-grammar");
    yield page.waitForSelector("div.fade-appear-done:nth-child(2) > div:nth-child(1)");
    yield page.waitForTimeout(500);
    while (true) {
        yield page.click("div.fade-appear-done:nth-child(2) > div:nth-child(1)", //
        {
            timeout: 1000 * 5,
        });
        yield page.waitForSelector("div.fade-appear-done:nth-child(2) > div:nth-child(1)");
        yield page.waitForTimeout(100);
        logger.info("Clicked");
    }
});
console.log("Starting a automation");
run();
process.on("uncaughtException", (error) => {
    errorRestartEmitter.emit("error");
    console.log(error);
    logger.error(`${error.name} - ${error.message}`);
});
