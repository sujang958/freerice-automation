import { webkit } from "playwright"
import Log4js from "log4js"
import { config } from "dotenv"
import { EventEmitter } from "stream"
import { automate } from "./automate"

config()

const INSTANCES = isNaN(Number(process.env.FR_INSTANCES))
  ? 1
  : Number(process.env.FR_INSTANCES)
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

console.log("Loaded", users.size, `user${users.size != 1 ? "s" : ""}:`, Array.from(users.keys()).join(", "))

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

  for (const [id, pw] of users.entries()) {
    const context = await browser.newContext()
    for (let i = 0; i < INSTANCES; i++) {
      automate(context, id, pw)
    }
  }
}

console.log("Starting an automation", new Date().toLocaleString())

run()

const handleError = (e: any) => {
  console.log(e)
  logger.error(e)
}

process.on("uncaughtException", handleError)

process.on("unhandledRejection", handleError)
