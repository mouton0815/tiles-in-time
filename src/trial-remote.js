// chrome --remote-debugging-port=9222 --user-data-dir="C:\tmp\ChromeProfile"

import 'chromedriver'
import chrome from 'selenium-webdriver/chrome.js'
import  { Builder, WebElementCondition, By, Key, until } from 'selenium-webdriver'
import fs from 'fs'

const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().debuggerAddress('127.0.0.1:9222'))
    .build()

try {
    // Load page and wait for title
    await driver.get('https://veloviewer.com')
    await driver.wait(until.titleContains('VeloViewer'))
    console.log('---> Title found')

    // Click on the "activities" menu entry
    const activitiesTab = await driver.wait(until.elementLocated(By.xpath('//ul[@id="myTabs"]/li/a[contains(@href, "/activities")]')))
    //const activitiesTab = await driver.findElement(By.xpath('//ul[@id="myTabs"]/li/a[contains(@href, "/activities")]'))
    //await driver.wait(until.elementIsVisible(activitiesTab))
    await activitiesTab.click()
    console.log('---> Activities clicked')
    // await sleep(3000) // TODO: Wait for element - which?

    const mapCheckbox = await driver.wait(until.elementLocated(By.id('viewMapCheckBox')))
    // const mapCheckbox = driver.findElement(By.id('viewMapCheckBox'))
    // await driver.wait(until.elementIsVisible(mapCheckbox))
    console.log('---> Map checkbox located')
    const mapContainer = await driver.wait(until.elementLocated(By.id('mapContainer')))
    const mapVisibility = await mapContainer.getCssValue("display")
    console.log('--mapVisibility-->', mapVisibility)
    if ('none' === mapVisibility) {
        await mapCheckbox.click()
        await driver.wait(until.elementIsVisible(mapContainer))
        console.log('---> Map container visible')
        // await sleep(2000)
    }
    /*
    // TODO: Strange behavior -- need to figure out which button is selected
    await driver.findElement(By.id('viewTableCheckBox')).click()
    await sleep(1000)
     */

    // Deselect photos
    const photosControl = await driver.wait(until.elementLocated(By.xpath('//a[@title="View photos"]')))
    console.log('---> Photos control is located')
    const photosControlColor = await photosControl.getCssValue("background-color")
    console.log('--photos-->', photosControlColor)
    if ('rgba(187, 187, 187, 1)' === photosControlColor ) {
        console.log('--photos--> CLICK')
        await photosControl.click()
        await sleep(1000)
    }

    // Select max square (TODO: This assumes that auto-zoom is enabled)
    const squareControl = await driver.wait(until.elementLocated(By.xpath('//a[contains(@title, "View Explorer Max Square")]')))
    console.log('---> Square control is located')
    const squareControlColor = await squareControl.getCssValue("background-color")
    console.log('--square-->', squareControlColor)
    if ('rgba(255, 255, 255, 1)' === squareControlColor ) {
        console.log('--square--> CLICK')
        await squareControl.click()
        await sleep(1000)
    }

    // Select max cluster. Deselect it first if needed and then re-select (TODO: This assumes that auto-zoom is enabled)
    const clusterControl = await driver.wait(until.elementLocated(By.xpath('//a[contains(@title, "View Explorer Max Cluster")]')))
    console.log('---> Cluster control is located')
    const clusterControlColor = await clusterControl.getCssValue("background-color")
    console.log('--cluster-->', clusterControlColor)
    if ('rgba(187, 187, 187, 1)' === clusterControlColor ) {
        console.log('--cluster--> CLICK to deselect')
        await clusterControl.click()
        await sleep(1000)
    }
    console.log('--cluster--> CLICK to reselect')
    await clusterControl.click()
    await sleep(1000)

    const data = await driver.takeScreenshot()
    const base64Data = data.replace(/^data:image\/png;base64,/,"")
    fs.writeFile("out.png", base64Data, 'base64', function(err) {
        if(err) console.log(err)
    })

} finally {
    await driver.quit()
}

async function sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time))
}