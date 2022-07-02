import { webkit } from "playwright"
import Log4js from "log4js"
import { config } from "dotenv"
import { EventEmitter } from "stream"

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
  const page = await browser.newPage({ ignoreHTTPSErrors: true })

  logger.info("Started a browser and page")

  errorRestartEmitter.once("error", async () => {
    logger.info("Restarting for error")
    run()
    await browser.close()
  })

  const closingPopupInterval = setInterval(async () => {
    if (!(await page.isVisible(".close-button.clickable"))) return
    await page.$eval(".close-button.clickable", (ele: any) => ele.click())
    logger.info("Closed a popup")
  }, 800)

  process.on("beforeExit", () => {
    clearInterval(closingPopupInterval)
  })

  process.on("beforeExit", () => {
    browser.close()
  })

  await page.goto("https://freerice.com/profile-login")
  await page.waitForLoadState("domcontentloaded")

  await Promise.all([
    page.waitForSelector("#login-username"),
    page.waitForSelector("#login-password"),
  ])

  await page.fill("#login-username", process.env.USER_NAME ?? "")
  await page.fill("#login-password", process.env.USER_PW ?? "")
  await page.click("button.user-login-submit")

  await page.waitForSelector(`text=${process.env.USER_NAME}`)
  await page.waitForTimeout(1000) // For safety

  logger.info(`Logined as ${process.env.USER_NAME}`)

  await page.goto("https://freerice.com/categories/multiplication-table")
  await page.waitForSelector(
    "div.fade-appear-done:nth-child(2) > div:nth-child(1)"
  )
  await page.waitForTimeout(500)

  while (true) {
    const toCalculate = await page.$(".card-title")
    if (!toCalculate) continue

    const content = await toCalculate.innerText()
    const [multiply1, multiply2] = content.split(" x ")
    const answer = Number(multiply1) * Number(multiply2)
    const selections = await page.$$(
      `div.fade-appear-done > div:text("${answer}")`
    )
    if (!selections) continue
    const selection = selections.find(
      async (selection) =>
        Number((await selection.innerText()).trim()) == answer
    )
    if (!selection) continue

    await selection.click()
    logger.info("Clicked")
    await page.waitForSelector(
      ".card-box.first-card.question-card-enter.question-card-enter-active"
    )
    await page.waitForTimeout(100)
    await page.waitForSelector(".card-box.question-card-enter-done")
    console.log("Loop")
  }
}

console.log("Starting a automation", new Date().toLocaleString())

run()

process.on("uncaughtException", (error) => {
  errorRestartEmitter.emit("error")
  console.log(error)
  logger.error(`${error.name} - ${error.message}`)
})
