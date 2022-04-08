// chrome --remote-debugging-port=9222 --user-data-dir="C:\tmp\ChromeProfile"

import 'chromedriver'
import chrome from 'selenium-webdriver/chrome.js'
import  { Builder, By, Key, until } from 'selenium-webdriver'
import sharp from 'sharp'

const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().debuggerAddress('127.0.0.1:9222'))
    .build()

try {
    await loadPage()
    await openActivitiesTab()

    // Show map
    await showContainer('viewMapCheckBox', 'mapContainer')

    // Hide all other containers in order to maximize view port
    await hideContainer('viewTableCheckBox', 'tableContainer')
    await hideContainer('viewChartCheckBox', 'chartContainer')
    await hideContainer('viewPhotosCheckBox', 'photosContainer')

    // Deselect photos
    await triggerMapControl('View photos', false)

    // Select max square (TODO: This assumes that auto-zoom is enabled)
    await triggerMapControl('View Explorer Max Square', true)

    // Select max cluster. Deselect it first if needed and then re-select (TODO: This assumes that auto-zoom is enabled)
    await triggerMapControl('View Explorer Max Cluster', false)
    await triggerMapControl('View Explorer Max Cluster', true)

    const mapDimensions = await getMapDimensions()
    for (let year = 2010; year <= 2021; year++) {
        await selectEndDate(`12/31/${year}`)
        await takeMapScreenshot(mapDimensions, `${year}-12.png`)
        await sleep(1000)
    }
    for (let month = 1; month <= 4; month++) {
        await selectEndDate(`${month}/31/2022`)
        await takeMapScreenshot(mapDimensions, `2022-${month}.png`)
        await sleep(1000)
    }
} finally {
    await driver.quit()
}

async function loadPage() {
    // Load page and wait for title
    await driver.get('https://veloviewer.com')
    await driver.wait(until.titleContains('VeloViewer'))
    console.log('---> Title found')
}

async function openActivitiesTab() {
    // Click on the "activities" menu entry
    const activitiesTab = await driver.wait(until.elementLocated(By.xpath('//ul[@id="myTabs"]/li/a[contains(@href, "/activities")]')))
    await activitiesTab.click()
    console.log('---> Activities clicked')
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

async function triggerMapControl(controlTitle, enableControl) {
    const control = await driver.wait(until.elementLocated(By.xpath(`//a[contains(@title, '${controlTitle}')]`)))
    console.log(`---> '${controlTitle}' is located`)
    const backgroundColor = await control.getCssValue('background-color')
    console.log(`---> '${controlTitle}' color: ${backgroundColor}`)
    const expectedColor = enableControl ? 'rgba(255, 255, 255, 1)' : 'rgba(187, 187, 187, 1)'
    if (expectedColor === backgroundColor) {
        console.log(`---> '${controlTitle}': CLICK`)
        await control.click()
        await sleep(200)
    }
}

async function selectEndDate(dateStr) {
    const filterExpander = await getElementById('filtersExpander')
    await filterExpander.click()
    console.log('---> FilterExpander clicked')
    const collapseFilter = await getElementById('collapseFilter')
    await driver.wait(until.elementIsVisible(collapseFilter))
    console.log('---> Filter visible')

    const dateField = await getElementById('max0')
    await dateField.clear()
    await dateField.sendKeys(dateStr)
    console.log(`---> Keys ${dateStr} sent`)
    await sleep(200)

    // Due to a VeloViewer bug, the maximum cluster is sometimes not colored correctly.
    // De- and then re-selecting the "Ride" checkbox corrects this.
    await clickRideCheckbox(false)
    await clickRideCheckbox(true)

    await filterExpander.click()
    console.log('---> FilterExpander clicked')
    await driver.wait(until.elementIsNotVisible(collapseFilter))
    console.log('---> Filter invisible')
}

async function clickRideCheckbox(targetState) {
    for (let attempts = 0; attempts < 5; attempts++) {
        try {
            const checkbox = await driver.wait(until.elementLocated(By.xpath("//input[@value='Ride']")))
            let isSelected = await checkbox.isSelected()
            console.log('---> Checkbox selected:', isSelected)
            if (targetState === isSelected) {
                console.log('---> Checkbox already in target state')
                break
            }
            await checkbox.click()
            console.log(`---> Clicked, attempt ${attempts}`)
            isSelected = await checkbox.isSelected()
            console.log('---> Checkbox selected now:', isSelected)
            if (targetState === isSelected) {
                break
            }
        } catch (e) {
            console.log(`---> Caught twice, attempt ${attempts}`)
        }
        await sleep(100) // Sleep a bit for next attempt
    }
    await sleep(100)
}

async function getMapDimensions() {
    const container = await getElementById('mapContainer')
    const viewPort = await container.getRect()
    console.log('---> viewPort: ', viewPort)
    return {
        left: Math.ceil(viewPort.x),
        top: Math.ceil(viewPort.y),
        width: Math.floor(viewPort.width),
        height: Math.floor(viewPort.height)
    }
}

async function takeMapScreenshot(mapDimensions, fileName) {
    const base64Shot = await driver.takeScreenshot()
    const base64Image = base64Shot.replace(/^data:image\/png;base64,/, '')
    const imageBuffer = Buffer.from(base64Image, 'base64')
    await sharp(imageBuffer).extract(mapDimensions).png().toFile(fileName)
}

async function getElementById(id) {
    const element = await driver.wait(until.elementLocated(By.id(id)))
    console.log(`---> ${id} located`)
    return element
}

async function sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time))
}