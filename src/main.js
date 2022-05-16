// & 'C:\Program Files\Google\Chrome\Application\chrome.exe' --remote-debugging-port=9222 --user-data-dir='C:\tmp\ChromeProfile'
// C:\Tools\ffmpeg-n5.0\bin\ffmpeg.exe -framerate 0.5 -i img%03d.png -c:v libx264 -vf fps=25 -pix_fmt yuv420p out.mp4
// https://trac.ffmpeg.org/wiki/Slideshow

import 'chromedriver'
import chrome from 'selenium-webdriver/chrome.js'
import  { Builder } from 'selenium-webdriver'
import { createFolder, isoToUkDate } from './utils.js'
import { readConfig } from './config.js'
import { login } from './login.js'
import { loadPage, preparePage } from './page-operations.js'
import { prepareMap } from './map-operations.js'
import { openFilters, selectEndDate } from './filter-operations.js'
import { takeScreenshot } from './screenshot.js'
import { getMapDimensions } from './map-operations.js'

const { mode, username, password, dates, chromePort } = readConfig()
const chromeOptions = chromePort ? new chrome.Options().debuggerAddress(`127.0.0.1:${chromePort}`) : null

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
    // Open the Filters toolbar (if it is not already open)
    await openFilters(driver)

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
