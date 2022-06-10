import 'chromedriver'
import chrome from 'selenium-webdriver/chrome.js'
import console_stamp from 'console-stamp'
import  { Builder } from 'selenium-webdriver'
import { createFolder, isoToUkDate } from './utils.js'
import { readConfig } from './config.js'
import { login } from './login.js'
import { loadPage, preparePage } from './page-operations.js'
import { prepareMap } from './map-operations.js'
import { selectEndDate } from './filter-operations.js'
import { takeScreenshot } from './screenshot.js'
import { getMapDimensions } from './map-operations.js'

// Add timestamp and log level to console logging
console_stamp(console, {  format: ':date(yyyy-mm-dd HH:MM:ss)' })

const { mode, username, password, dates, chromePort } = readConfig()
const chromeOptions = chromePort
    ? new chrome.Options().debuggerAddress(`127.0.0.1:${chromePort}`)
    : new chrome.Options().addArguments('--start-maximized')

const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build()

try {
    if (mode <= 1) {
        await loadPage(driver)
        await login(driver, username, password)
        await preparePage(driver)
    }
    if (mode <= 2) {
        await prepareMap(driver, dates[dates.length - 1])
    }

    createFolder('screenshots')
    const dimensions = await getMapDimensions(driver)
    for (let index = 0; index < dates.length; index++) {
        const line = dates[index]
        await selectEndDate(driver, isoToUkDate(line))
        await takeScreenshot(driver, dimensions, line, index)
    }
} finally {
    await driver.quit()
}
