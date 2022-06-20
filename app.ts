import { webkit } from "playwright"
import Log4js from "log4js"
import { config } from "dotenv"

config()

Log4js.configure({
  appenders: { log: { type: "file", filename: "run.log" } },
  categories: { default: { appenders: ["log"], level: "all" } },
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

  logger.info(`Logined as ${process.env.USER_NAME}`)

  await page.goto("https://freerice.com/categories/english-vocabulary")
  await page.waitForSelector(
    "#root > section > div > div:nth-child(1) > div > div > div.game-block > div.question.question--single-option > div > div > div > div > div > div:nth-child(2) > div"
  )
  await page.waitForTimeout(500)

  let i = 0
  while (true) {
    i += 1
    await page.click(
      "#root > section > div > div:nth-child(1) > div > div > div.game-block > div.question.question--single-option > div > div > div > div > div > div:nth-child(2) > div"
    )
    await page.waitForTimeout(1000)
    logger.info("Clicked")

    if (i >= 29) {
      await page.goto("https://freerice.com/categories/english-vocabulary")
      await page.waitForSelector(
        "#root > section > div > div:nth-child(1) > div > div > div.game-block > div.question.question--single-option > div > div > div > div > div > div:nth-child(2) > div"
      )
      await page.waitForTimeout(500)
      i = 0
    }
  }
}

run()

process.on("uncaughtException", (error) => {
  console.log(error)
  logger.error(`${error.name} - ${error.message}`)
})
