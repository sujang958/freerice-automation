import { Page, webkit } from "playwright"
import Log4js from "log4js"
import { config } from "dotenv"
import { EventEmitter } from "stream"
import { automate } from "./automate"

config()

const errorRestartEmitter = new EventEmitter()

Log4js.configure({
  appenders: { log: { type: "file", filename: "run.log" } },
  categories: { default: { appenders: ["log"], level: "all" } },
})

const logger = Log4js.getLogger("log")

const run = async () => {
  const browser = await webkit.launch({
    headless: process.env.NODE_ENV === "production" ? true : false,
  })
  logger.info("Opened a browser")

  errorRestartEmitter.once("error", async () => {
    logger.info("Restarting for an error")
    run()
    await browser.close()
  })

  for (let i = 0; i < 4; i++) {
    automate(browser)
  }
}

console.log("Starting an automation", new Date().toLocaleString())

run()

process.on("uncaughtException", (error) => {
  errorRestartEmitter.emit("error")
  console.log(error)
  logger.error(`${error.name} - ${error.message}`)
})
