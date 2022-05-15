import { By } from 'selenium-webdriver'
import { isoToUkDate, sleep } from './utils.js'
import { selectEndDate } from './filter-operations.js'
import { getElementById, getElementByPath } from './locators.js'
import { clickCheckbox } from './checkbox.js'

export async function getMapDimensions(driver) {
    const container = await getElementById(driver, 'mapContainer')
    const viewPort = await container.getRect()
    // console.log('---> map viewport raw:', viewPort)
    return  {
        x: Math.ceil(viewPort.x),
        y: Math.ceil(viewPort.y),
        w: Math.floor(viewPort.width),
        h: Math.floor(viewPort.height)
    }
}

export async function disableAutoZoom(driver) {
    const mapControlButton = await getMapControl(driver, 'Map settings')
    await mapControlButton.click()

    await clickCheckbox(driver, By.id('mapAutoZoomCheckBox'), false)
    await sleep(500) // Do not close modal window too fast

    const closeButton = await getElementByPath(driver, '//button[text()="Close"]')
    await closeButton.click()
    console.log('---> Auto zoom disabled')
}

export async function prepareMap(driver, isoEndDate) {
    console.log('---> Deselect photos on map')
    await triggerMapControl(driver, 'View photos', false)
    // await sleep(1000)

    const endDate = isoToUkDate(isoEndDate)
    console.log(`---> Set map end date to ${endDate}`)
    await selectEndDate(driver, endDate)
    // await sleep(2000)

    console.log('---> Select max square') // This assumes that auto-zoom is enabled
    await triggerMapControl(driver, 'View Explorer Max Square', true)
    // await sleep(2000)

    console.log('---> Select max cluster')
    // Deselect cluster first if needed and then re-select - this assumes that auto-zoom is enabled
    await triggerMapControl(driver, 'View Explorer Max Cluster', false)
    // await sleep(2000)
    await triggerMapControl(driver, 'View Explorer Max Cluster', true)
    // await sleep(2000)
}

async function triggerMapControl(driver, controlTitle, enableControl) {
    const control = await getMapControl(driver, controlTitle)
    // console.log(`---> '${controlTitle}' is located`)
    const backgroundColor = await control.getCssValue('background-color')
    // console.log(`---> '${controlTitle}' color: ${backgroundColor}`)
    const expectedColor = enableControl ? 'rgba(187, 187, 187, 1)' : 'rgba(255, 255, 255, 1)'
    if (expectedColor !== backgroundColor) {
        await control.click()
        // console.log(`---> '${controlTitle}' ${enableControl ? 'enabled' : 'disabled'}`)
        await sleep(500)
    }
}

async function getMapControl(driver, controlTitle) {
    return await getElementByPath(driver, `//a[contains(@title, '${controlTitle}')]`)
}
