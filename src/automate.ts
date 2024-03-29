import { Browser, BrowserContext, Page } from "playwright"
import { logger } from "./logger"

const getProgress = async (page: Page) => {
  const progress = await page.$(
    "div.block:nth-child(1) > div:nth-child(2) > p:nth-child(1) > strong:nth-child(2)"
  )

  if (!progress) return null

  const progressAsNumber = Number(
    (await progress.innerText()).replace(/,/gi, "")
  )

  return isNaN(progressAsNumber) ? null : progressAsNumber
}

export const automate = async (
  context: BrowserContext,
  id: string,
  pw: string
) => {
  const page = await context.newPage()

  logger.info(`[${id}] Created a new page`)

  process.on("beforeExit", () => {
    context.close()
  })

  await page.goto("https://play.freerice.com/profile-login")
  await page.waitForLoadState("domcontentloaded")

  await page.screenshot({ path: "./asdf.png" })

  await page.fill("#login-username", id)
  await page.fill("#login-password", pw)
  await page.click("button.user-login-submit")

  await page.waitForSelector(`.sign-out`)
  await page.waitForTimeout(1000)

  logger.info(`Logined as ${id}`)

  await page.goto("https://play.freerice.com/categories/multiplication-table")
  await page.waitForSelector(
    "div.fade-appear-done:nth-child(2) > div:nth-child(1)"
  )
  await page.waitForTimeout(500)

  let previousProgress: null | number = null
  setInterval(async () => {
    if (!previousProgress) {
      previousProgress = await getProgress(page)

      return
    }
    const progress = await getProgress(page)

    if (!progress) return logger.info("Can't get progress")

    logger.info(`[${id}] ${(progress - previousProgress) / 10} grains / sec`)

    previousProgress = progress
  }, 10000)

  setInterval(async () => {
    try {
      const visible = await page.isVisible(".close-button.clickable")
      if (!visible) return

      await page.click(".close-button.clickable")
      logger.info("Closed a popup")
    } catch (e) {
      logger.error(e)
    }
  }, 10000)

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

    logger.info(`[${id}] Clicked`)

    await page.waitForSelector(
      ".card-box.first-card.question-card-enter.question-card-enter-active"
    )
    await page.waitForSelector(".card-box.question-card-enter-done")

    getProgress(page)
      .then((progress) => {
        logger.info(
          `[${id}] donated rices so far: ${progress?.toLocaleString()}`
        )
      })
      .catch(() => console.log("Failed getting the progress of", id))

    await page.waitForTimeout(300)
  }
}
