import { webkit } from "playwright"
import Log4js from "log4js"

import "dotenv/config"

Log4js.configure({
  appenders: { log: { type: "file", filename: "run.log" } },
  categories: {},
})

const logger = Log4js.getLogger("log")

const run = async () => {
  const browser = await webkit.launch({
    headless: process.env.NODE_ENV === "production" ? true : false,
  })
  const page = await browser.newPage()

  await page.goto("https://freerice.com/profile-login")
  await page.waitForLoadState("domcontentloaded")

  await Promise.all([
    page.waitForSelector("#login-username"),
    page.waitForSelector("#login-password"),
  ])

  await page.type("#login-username", process.env.USER_NAME ?? "")
  await page.fill("#login-password", process.env.USER_PW ?? "")
  await page.click(
    "#root > section > div > div:nth-child(1) > div > div.page__body > div > div > div:nth-child(5) > button"
  )

  await page.waitForSelector(`text=${process.env.USER_NAME}`)
  await page.waitForTimeout(1000) // For safety

  await page.goto("https://freerice.com/categories/english-vocabulary")
  await page.waitForSelector(
    "#root > section > div > div:nth-child(1) > div > div > div.game-block > div.question.question--single-option > div > div > div > div > div > div:nth-child(2) > div"
  )
  await page.waitForTimeout(500)

  while (true) {
    await page.click(
      "#root > section > div > div:nth-child(1) > div > div > div.game-block > div.question.question--single-option > div > div > div > div > div > div:nth-child(2) > div"
    )
    await page.waitForTimeout(1000)
    logger.info("Clicked")
  }
}

run()

process.on("uncaughtException", (error) => {
  console.log(error)
  logger.error(`${error.name} - ${error.message}`)
})
