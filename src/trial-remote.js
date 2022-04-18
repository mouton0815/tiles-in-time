// chrome --remote-debugging-port=9222 --user-data-dir="C:\tmp\ChromeProfile"
// C:\Tools\ffmpeg-n5.0\bin\ffmpeg.exe -framerate 0.5 -i img%03d.png -c:v libx264 -vf fps=25 -pix_fmt yuv420p out.mp4

import 'chromedriver'
import chrome from 'selenium-webdriver/chrome.js'
import  { Builder, By, until } from 'selenium-webdriver'
import jimp from 'jimp'


const DATES = [
    /*
    '2010-04-01',
    '2010-05-01',
    '2010-06-01',
    '2010-07-01',
    '2010-08-01',
    '2010-09-01',
    '2010-10-01',
    '2010-11-01',

    '2011-04-01',
    '2011-05-01',
    '2011-06-01',
    '2011-07-01',
    '2011-08-01',
    '2011-09-01',
    '2011-10-01',
    '2011-11-01',
    '2011-12-01',

    '2012-03-01',
    '2012-04-01',
    '2012-05-01',
    '2012-06-01',
    '2012-07-01',
    '2012-08-01',
    '2012-09-01',
    '2012-10-01',

    '2013-06-01',
    '2013-07-01',
    '2013-08-01',
    '2013-09-01',
    '2013-10-01',

    '2014-05-01',
    '2014-06-01',
    '2014-07-01',
    '2014-08-01',
    '2014-09-01',
    '2014-10-01',
    '2014-11-01',
    '2014-12-01',

    '2015-04-01',
    '2015-05-01',
    '2015-06-01',
    '2015-07-01',
    '2015-08-01',
    '2015-09-01',
    '2015-10-01',
    '2015-11-01',
    '2015-12-01',

    '2016-05-01',
    '2016-06-01',
    '2016-08-01',
    '2016-09-01',
    '2016-10-01',
    '2016-11-01',

    '2017-04-01',
    '2017-05-01',
    '2017-06-01',
    '2017-07-01',
    '2017-08-01',
    '2017-09-01',
    '2017-10-01',
    '2017-12-01',

    '2018-04-01',
    '2018-05-01',
    '2018-06-01',
    '2018-07-01',
    '2018-08-01',
    '2018-09-01',
    '2018-10-01',
    '2018-11-01',
    '2018-12-01',

    '2019-04-01',
    '2019-05-01',
    '2019-06-01',
    '2019-07-01',
    '2019-08-01',
    '2019-09-01',
    '2019-10-01',
    '2019-11-01',
    '2019-12-01',

    '2020-04-01',
    '2020-05-01',
    '2020-06-01',
    '2020-07-01',
    '2020-09-01',
    '2020-10-01',
    '2020-11-01',
    '2020-12-01',
    */

    '2021-03-01',
    '2021-05-01',
    '2021-06-01',
    '2021-07-01',
    '2021-08-01',
    '2021-09-01',
    '2021-10-01',
    '2021-11-01',
    '2021-12-01',

    '2022-01-01',
    '2022-02-22',
    '2022-02-23',
    '2022-02-26',
    '2022-02-27',
    '2022-03-03',
    '2022-03-05',
    '2022-03-10',
    '2022-03-12',
    '2022-03-20',
    '2022-03-22',
    '2022-03-23',
    '2022-03-25',
    '2022-03-26',
    '2022-04-02',
]

const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().debuggerAddress('127.0.0.1:9222'))
    .build()

try {
    /*
    await loadPage()
    await openActivitiesTab()

    // Show map
    await showContainer('viewMapCheckBox', 'mapContainer')

    // Hide all other containers in order to maximize view port
    await hideContainer('viewTableCheckBox', 'tableContainer')
    await hideContainer('viewChartCheckBox', 'chartContainer')
    await hideContainer('viewPhotosCheckBox', 'photosContainer')

    // Deselect photos on map
    await triggerMapControl('View photos', false)

    // Select max square (TODO: This assumes that auto-zoom is enabled)
    await triggerMapControl('View Explorer Max Square', true)

    // Select max cluster. Deselect it first if needed and then re-select (TODO: This assumes that auto-zoom is enabled)
    await triggerMapControl('View Explorer Max Cluster', false)
    await triggerMapControl('View Explorer Max Cluster', true)
    */

    /*
    console.log('---> OPEN')
    await openFilters()
    await sleep(500) // To let map expand TODO: Needed?
    console.log('---> CLOSE')
    await closeFilters()
    console.log('---> CLOSED')
    await sleep(500) // To let map expand TODO: Needed?
    */

    const mapDimensions = await getMapDimensions()
    for (let index = 0; index < DATES.length; index++) {
        const isoDate = DATES[index]
        const [year, month, day] = isoDate.split('-', 3);
        await selectEndDate(`${month}/${day}/${year}`, index)
        // await sleep(3000) // The "Show Filters" menu needs time to collapse -- TODO: How to observe this w/o waiting?
        await takeMapScreenshot(mapDimensions, isoDate, index)
        // await sleep(200)
    }

    /*
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
    */
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
    // console.log(`---> '${controlTitle}' is located`)
    const backgroundColor = await control.getCssValue('background-color')
    // console.log(`---> '${controlTitle}' color: ${backgroundColor}`)
    const expectedColor = enableControl ? 'rgba(255, 255, 255, 1)' : 'rgba(187, 187, 187, 1)'
    if (expectedColor === backgroundColor) {
        // console.log(`---> '${controlTitle}': CLICK`)
        await control.click()
        await sleep(200)
    }
}

async function openFilters() {
    const filterExpander = await getElementById('filtersExpander')
    await filterExpander.click()
    // console.log('---> FilterExpander clicked')
    const collapseFilter = await getElementById('collapseFilter')
    await driver.wait(until.elementIsVisible(collapseFilter))
    // console.log('---> Filter visible')
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
    // await openFilters()

    const dateField = await getElementById('max0')
    await dateField.clear()
    await dateField.sendKeys(dateStr)
    // console.log(`---> Keys ${dateStr} sent`)
    // await sleep(200) // TODO: Enable?

    // Due to a VeloViewer bug, the maximum cluster is sometimes not colored correctly.
    // De- and then re-selecting the "Ride" checkbox corrects this.
    await clickRideCheckbox(false)
    await clickRideCheckbox(true)
    // await sleep(1000) // Closing the Ride checkbox makes the map re-arrange, thus wait TODO: Needed?

    // await closeFilters()
}

async function clickRideCheckbox(targetState) {
    // await sleep(100) // Initial wait to lower failure risk TODO: Needed?
    for (let attempts = 0; attempts < 5; attempts++) {
        try {
            const checkbox = await driver.wait(until.elementLocated(By.xpath("//input[@value='Ride']")))
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
            if (attempts >= 1) {
                console.log(`---> Caught, attempt ${attempts + 1}`)
            }
            await sleep(100) // Sleep a bit for next attempt
        }
    }
    // await sleep(200)
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

async function takeMapScreenshot(mapDimensions, isoDate, counter) {
    console.log('---> take screenshot of', isoDate)
    const base64Shot = await driver.takeScreenshot()
    const base64Image = base64Shot.replace(/^data:image\/png;base64,/, '')
    const imageBuffer = Buffer.from(base64Image, 'base64')

    const image = await jimp.read(imageBuffer)
    image.crop(mapDimensions.x, mapDimensions.y, mapDimensions.w, mapDimensions.h)
    const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK)
    image.print(font, 20, mapDimensions.h - 50, isoDate)
    const fileName = `img${String(counter).padStart(3, '0')}.png`
    await image.writeAsync(fileName)
}

async function getElementById(id) {
    const element = await driver.wait(until.elementLocated(By.id(id)))
    // console.log(`---> ${id} located`)
    return element
}

async function sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time))
}