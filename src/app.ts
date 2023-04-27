import { Page, webkit } from "playwright"
import Log4js from "log4js"
import { config } from "dotenv"
import { EventEmitter } from "stream"
import { automate } from "./automate"

config()

const USER_PREFIX = "FR_USER_"
const PW_PREFIX = "FR_PW_"

const userKeys = Object.entries(process.env)
  .filter(([key]) => key.startsWith(USER_PREFIX))
  .map(([key, value]) => ({
    key: key.replace(USER_PREFIX, ""),
    name: value,
  }))
  .filter(({ name }) => name)

const users = new Map<string, string>()
for (const { key, name } of userKeys) {
  const pw = process.env[`${PW_PREFIX}${key}`]
  if (!pw || !name) throw new Error(`Password not found for ${key}`)
  users.set(name, pw)
}

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

  for (const [id, pw] of users.entries()) {
    for (let i = 0; i < 4; i++) {
      automate(browser, id, pw)
    }
  }
}

console.log("Starting an automation", new Date().toLocaleString())

run()

const handleError = (e: any) => {
  errorRestartEmitter.emit("error")
  console.log(e)
  logger.error(e)
}

process.on("uncaughtException", handleError)

process.on("unhandledRejection", handleError)
