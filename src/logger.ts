import Log4js from "log4js"

Log4js.configure({
  appenders: { log: { type: "file", filename: "run.log" } },
  categories: { default: { appenders: ["log"], level: "all" } },
})

export const logger = Log4js.getLogger("log")
