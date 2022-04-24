// chrome --remote-debugging-port=9222 --user-data-dir="C:\tmp\ChromeProfile"
// C:\Tools\ffmpeg-n5.0\bin\ffmpeg.exe -framerate 0.5 -i img%03d.png -c:v libx264 -vf fps=25 -pix_fmt yuv420p out.mp4
// https://trac.ffmpeg.org/wiki/Slideshow

import 'chromedriver'
import chrome from 'selenium-webdriver/chrome.js'
import  { Builder, By, until } from 'selenium-webdriver'
import jimp from 'jimp'
import { readConfig } from './config.js'


const { username, password, dates, chromePort } = readConfig()
const chromeOptions = chromePort ? new chrome.Options().debuggerAddress(`127.0.0.1:${chromePort}`) : null

const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build()

try {
    // await loadPage()
    // await login() // TODO: Login only if necessary
    // await prepareMapView()

    const mapDimensions = await getMapDimensions()
    for (let index = 0; index < dates.length; index++) {
        // TODO: Put loop content into a function
        const line = dates[index]
        const [date] = line.split(' ') // Chop-off the optional tour name
        const [year, month, day] = date.split('-', 3);
        await selectEndDate(`${month}/${day}/${year}`, index)
        await takeMapScreenshot(mapDimensions, line, index)
    }
} finally {
    await driver.quit()
}

async function loadPage() {
    // Load page and wait for title
    await driver.get('https://veloviewer.com')
    await driver.wait(until.titleContains('VeloViewer'))
    console.log('---> Page loaded')
}

async function login() {
    const updateButton = await getElementByPath('(//a[@href="/update"])[1]')
    console.log('---> Update button located')
    await updateButton.click()

    // VeloViewer now routes to Strava
    await driver.wait(until.titleContains('Strava'))
    const usernameField = await getElementById('email')
    await usernameField.sendKeys(username)
    await sleep(1000)
    const passwordField = await getElementById('password')
    await passwordField.sendKeys(password)
    await sleep(1000)
    const loginButton = await getElementById('login-button')
    await loginButton.click()

    await driver.wait(until.titleContains('VeloViewer'))
}

async function prepareMapView() {
    await openActivitiesTab()
    await sleep(3000) // Let the filters bar collapse automatically // TODO: Can this be done better?

    // Show map
    await showContainer('viewMapCheckBox', 'mapContainer')

    // Hide all other containers in order to maximize view port
    await hideContainer('viewTableCheckBox', 'tableContainer')
    await hideContainer('viewChartCheckBox', 'chartContainer')
    await hideContainer('viewPhotosCheckBox', 'photosContainer')

    await deselectAutoZoom()

    await openFilters()

    // Deselect photos on map
    await triggerMapControl('View photos', false)

    // Select max square (TODO: This assumes that auto-zoom is enabled)
    await triggerMapControl('View Explorer Max Square', true)

    // Select max cluster. Deselect it first if needed and then re-select (TODO: This assumes that auto-zoom is enabled)
    await triggerMapControl('View Explorer Max Cluster', false)
    await triggerMapControl('View Explorer Max Cluster', true)
}

async function deselectAutoZoom() {
    const mapControlButton = await selectMapControl('Map settings')
    await mapControlButton.click()

    const autoZoomCheckbox = await getElementById('mapAutoZoomCheckBox')
    await clickCheckbox(autoZoomCheckbox, false)
    await sleep(1000) // Do not close model window too fast TODO: Necessary?

    const closeButton = await getElementByPath('//button[text()="Close"]')
    await closeButton.click()
    await sleep(1000) // Do not close model window too fast TODO: Necessary?
}

async function openActivitiesTab() {
    // Click on the "activities" menu entry
    const activitiesTab = await driver.wait(until.elementLocated(By.xpath('//ul[@id="myTabs"]/li/a[contains(@href, "/activities")]'))) // TODO: Replace by getElementByPath
    await activitiesTab.click()
    console.log('---> Activities opened')
}

async function showContainer(checkboxId, containerId) {
    const container = await getElementById(containerId)
    const displayed = await container.isDisplayed()
    // console.log(`---> ${containerId} displayed: ${displayed}`)
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
    // console.log(`---> ${containerId} displayed: ${displayed}`)
    if (displayed) {
        const checkbox = await getElementById(checkboxId)
        await checkbox.click()
        await driver.wait(until.elementIsNotVisible(container))
        console.log(`---> ${containerId} hidden`)
    }
}

async function triggerMapControl(controlTitle, enableControl) {
    const control = await selectMapControl(controlTitle)
    // console.log(`---> '${controlTitle}' is located`)
    const backgroundColor = await control.getCssValue('background-color')
    // console.log(`---> '${controlTitle}' color: ${backgroundColor}`)
    const expectedColor = enableControl ? 'rgba(187, 187, 187, 1)' : 'rgba(255, 255, 255, 1)'
    if (expectedColor !== backgroundColor) {
        console.log(`---> '${controlTitle}': CLICK`)
        await control.click()
        await sleep(300)
    }
}

async function selectMapControl(controlTitle, enableControl) {
    return await driver.wait(until.elementLocated(By.xpath(`//a[contains(@title, '${controlTitle}')]`))) // TODO: Replace by getElementByPath
}

async function openFilters() {
    const filterExpander = await getElementById('filtersExpander')
    await filterExpander.click()
    console.log('---> FilterExpander clicked')
    const collapseFilter = await getElementById('collapseFilter')
    await driver.wait(until.elementIsVisible(collapseFilter))
    console.log('---> Filters visible')
    await sleep(1000) // TODO: Remove
}

async function closeFilters() {
    const filterExpander = await getElementById('filtersExpander')
    await filterExpander.click()
    // console.log('---> FilterExpander clicked')
    const collapseFilter = await getElementById('collapseFilter')
    await driver.wait(until.elementIsNotVisible(collapseFilter))
    // console.log('---> Filter invisible')
}

async function selectEndDate(dateStr) {
    const dateField = await getElementById('max0')
    await dateField.clear()
    await dateField.sendKeys(dateStr)

    // Due to a VeloViewer bug, the maximum cluster is sometimes not colored correctly.
    // De- and then re-selecting the "Ride" checkbox corrects this.
    await clickRideCheckbox(false)
    await clickRideCheckbox(true)
}

async function clickRideCheckbox(targetState) {
    // TODO: Replace loop by function clickCheckbox
    let attempts = 0
    while (true) {
        try {
            const checkbox = await driver.wait(until.elementLocated(By.xpath("//input[@value='Ride']"))) // TODO: Replace by getElementByPath
            let isSelected = await checkbox.isSelected()
            // console.log('---> Checkbox selected:', isSelected)
            if (targetState === isSelected) {
                console.log('---> Checkbox already in target state')
                break
            }
            await checkbox.click()
            // console.log(`---> Clicked, attempt ${attempts + 1}`)
            isSelected = await checkbox.isSelected()
            //console.log('---> Checkbox selected now:', isSelected)
            if (targetState === isSelected) {
                break
            }
        } catch (e) {
            if (++attempts === 10) {
                throw new Error('Selecting the "Ride" checkbox failed after 10 attempts')
            }
            await sleep(100) // Sleep a bit for next attempt
        }
    }
}

async function clickCheckbox(checkbox, targetState) {
    let attempts = 0
    while (true) {
        try {
            let isSelected = await checkbox.isSelected()
            console.log('---> Checkbox selected:', isSelected)
            if (targetState === isSelected) {
                console.log('---> Checkbox already in target state')
                break
            }
            await checkbox.click()
            console.log(`---> Clicked, attempt ${attempts + 1}`)
            isSelected = await checkbox.isSelected()
            console.log('---> Checkbox selected now:', isSelected)
            if (targetState === isSelected) {
                break
            }
        } catch (e) {
            if (++attempts === 10) {
                throw new Error('Checkbox selection failed after 10 attempts')
            }
            console.log(`---> Checkbox click attempt ${attempts} failed, retrying`)
            await sleep(100) // Sleep a bit for next attempt
        }
    }
}

async function getMapDimensions() {
    const container = await getElementById('mapContainer')
    const viewPort = await container.getRect()
    // console.log('---> map viewport raw:', viewPort)
    return  {
        x: Math.ceil(viewPort.x),
        y: Math.ceil(viewPort.y),
        w: Math.floor(viewPort.width),
        h: Math.floor(viewPort.height)
    }
}

async function takeMapScreenshot(mapDimensions, label, counter) {
    console.log(`---> take screenshot of '${label}' with dimensions`, mapDimensions)

    const base64Shot = await driver.takeScreenshot()
    const base64Image = base64Shot.replace(/^data:image\/png;base64,/, '')
    const imageBuffer = Buffer.from(base64Image, 'base64')

    const image = await jimp.read(imageBuffer)
    image.crop(mapDimensions.x, mapDimensions.y, mapDimensions.w, mapDimensions.h)
    const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK)
    image.print(font, 20, mapDimensions.h - 50, label)
    const fileName = `screenshots/img${String(counter).padStart(3, '0')}.png`
    await image.writeAsync(fileName)
}

async function getElementById(id) {
    return await driver.wait(until.elementLocated(By.id(id)))
}

async function getElementByPath(path) {
    return await driver.wait(until.elementLocated(By.xpath(path)))
}

async function sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time))
}