import 'chromedriver'
import chrome from 'selenium-webdriver/chrome.js'
import { Builder, By, Key, until } from 'selenium-webdriver'
import {sleep} from "./utils.js";
import {getElementByPath} from "./locators.js";

const chromeOptions = new chrome.Options().debuggerAddress('127.0.0.1:9222')

const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build()

try {
    const elem = await driver.wait(until.elementLocated(By.className('lm_opacitySlider')))
    console.log('----->', elem)

    /*
    const actions = driver.actions()
    for (let i = -35; i <= 35; i += 5) {
        console.log('--->', i)
        await actions.dragAndDrop(elem, { x: i, y: 0 }).perform()
        await sleep(100)
    }
    */
    /*
    const actions = driver.actions()
    await actions.dragAndDrop(elem, { x: -40, y: 0 }).perform()
    await sleep(1000)
    await actions.dragAndDrop(elem, { x: -30, y: 0 }).perform()
    await sleep(1000)
    await actions.dragAndDrop(elem, { x: -25, y: 0 }).perform()
    */

    await elem.sendKeys('value', Key.LEFT)
    // await elem.sendKeys('value', '0.5')
    // await elem.setAttribute('value', '0.9')
    // await driver.executeScript('arguments[0].stepDown()', elem)
    await sleep(2000)
    // await driver.executeScript("arguments[0].setAttribute('value', arguments[1])", elem, '0.5')

    /*
    await sleep(500) // Do not close modal window too fast
    const closeButton = await getElementByPath(driver, '//button[text()="Close"]')
    await closeButton.click()
    */
} finally {
    await driver.quit()
}
