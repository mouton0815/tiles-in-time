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
    await activitiesTab.click()
    console.log('---> Activities clicked')

    // Show map
    await showContainer('viewMapCheckBox', 'mapContainer')

    // Hide all other containers in order to maximize view port
    await hideContainer('viewTableCheckBox', 'tableContainer')
    await hideContainer('viewChartCheckBox', 'chartContainer')
    await hideContainer('viewPhotosCheckBox', 'photosContainer')

    // Deselect photos
    const photosControl = await driver.wait(until.elementLocated(By.xpath('//a[contains(@title, "View photos")]')))
    console.log('---> Photos control is located')
    const photosControlColor = await photosControl.getCssValue("background-color")
    console.log('--photos-->', photosControlColor)
    if ('rgba(187, 187, 187, 1)' === photosControlColor ) {
        console.log('--photos--> CLICK')
        await photosControl.click()
        await sleep(100)
    }

    // Select max square (TODO: This assumes that auto-zoom is enabled)
    const squareControl = await driver.wait(until.elementLocated(By.xpath('//a[contains(@title, "View Explorer Max Square")]')))
    console.log('---> Square control is located')
    const squareControlColor = await squareControl.getCssValue("background-color")
    console.log('--square-->', squareControlColor)
    if ('rgba(255, 255, 255, 1)' === squareControlColor ) {
        console.log('--square--> CLICK')
        await squareControl.click()
        await sleep(100)
    }

    // Select max cluster. Deselect it first if needed and then re-select (TODO: This assumes that auto-zoom is enabled)
    const clusterControl = await driver.wait(until.elementLocated(By.xpath('//a[contains(@title, "View Explorer Max Cluster")]')))
    console.log('---> Cluster control is located')
    const clusterControlColor = await clusterControl.getCssValue("background-color")
    console.log('--cluster-->', clusterControlColor)
    if ('rgba(187, 187, 187, 1)' === clusterControlColor ) {
        console.log('--cluster--> CLICK to deselect')
        await clusterControl.click()
        await sleep(100)
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

async function showContainer(checkboxId, containerId) {
    const container = await getElementById(containerId)
    const displayed = await container.isDisplayed()
    console.log(`---> ${containerId} displayed: ${displayed}`)
    if (!displayed) {
        const checkbox = await getElementById(checkboxId)
        await checkbox.click()
        await driver.wait(until.elementIsVisible(container))
        console.log(`---> ${containerId} visible`)
    }
}

async function hideContainer(checkboxId, containerId) {
    const container = await getElementById(containerId)
    const displayed = await container.isDisplayed()
    console.log(`---> ${containerId} displayed: ${displayed}`)
    if (displayed) {
        const checkbox = await getElementById(checkboxId)
        await checkbox.click()
        await driver.wait(until.elementIsNotVisible(container))
        console.log(`---> ${containerId} hidden`)
    }
}

async function isContainerVisible(containerId) {
    const container = await driver.wait(until.elementLocated(By.id(containerId)))
    const visibility = await container.getCssValue('display')
    console.log(`---> ${containerId} visibility: ${visibility}`)
    return visibility !== 'none'
}

async function getElementById(id) {
    const element = await driver.wait(until.elementLocated(By.id(id)))
    console.log(`---> ${id} located`)
    return element
}

async function sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time))
}