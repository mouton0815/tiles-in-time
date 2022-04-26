// chrome --remote-debugging-port=9222 --user-data-dir="C:\tmp\ChromeProfile"
// C:\Tools\ffmpeg-n5.0\bin\ffmpeg.exe -framerate 0.5 -i img%03d.png -c:v libx264 -vf fps=25 -pix_fmt yuv420p out.mp4
// https://trac.ffmpeg.org/wiki/Slideshow

import 'chromedriver'
import chrome from 'selenium-webdriver/chrome.js'
import  { Builder } from 'selenium-webdriver'
import { readConfig } from './config.js'
import { loadPage, preparePage } from './page-operations.js'
import { login } from './login.js'
import { selectEndDate } from './filter-operations.js'
import { takeScreenshot } from './screenshot.js'
import { getMapDimensions } from './map-operations.js'

const { username, password, dates, chromePort } = readConfig()
const chromeOptions = chromePort ? new chrome.Options().debuggerAddress(`127.0.0.1:${chromePort}`) : null

const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build()

try {
    await loadPage(driver)
    await login(driver, username, password)
    await preparePage(driver)

    /*
    const dimensions = await getMapDimensions(driver)
    for (let index = 0; index < dates.length; index++) {
        const line = dates[index]
        await selectEndDate(driver, isoToUkDate(line), index)
        await takeScreenshot(driver, dimensions, line, index)
    }
    */
} finally {
    await driver.quit()
}

function isoToUkDate(isoDate) {
    const [date] = isoDate.split(' ') // Chop-off the optional tour name
    const [year, month, day] = date.split('-', 3)
    return `${month}/${day}/${year}`
}