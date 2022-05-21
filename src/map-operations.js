import { By } from 'selenium-webdriver'
import { isoToUkDate, sleep } from './utils.js'
import { openFilters, selectEndDate} from './filter-operations.js'
import { getElementById, getElementByPath } from './locators.js'
import { clickCheckbox } from './checkbox.js'

export async function getMapDimensions(driver) {
    const container = await getElementById(driver, 'mapContainer')
    const viewPort = await container.getRect()
    const dimensions = {
        x: Math.ceil(viewPort.x),
        y: Math.ceil(viewPort.y),
        w: Math.floor(viewPort.width),
        h: Math.floor(viewPort.height)
    }
    console.log('Use screenshot viewport', dimensions)
    return dimensions
}

export async function disableAutoZoom(driver) {
    const mapControlButton = await getMapControl(driver, 'Map settings')
    await mapControlButton.click()

    await clickCheckbox(driver, By.id('mapAutoZoomCheckBox'), false)
    await sleep(500) // Do not close modal window too fast

    const closeButton = await getElementByPath(driver, '//button[text()="Close"]')
    await closeButton.click()
    console.log('Auto zoom disabled')
}

export async function prepareMap(driver, isoEndDate) {
    await openFilters(driver)

    console.log('Deselect photos on map')
    await triggerMapControl(driver, 'View photos', false)

    const endDate = isoToUkDate(isoEndDate)
    console.log(`Set map end date to ${endDate}`)
    await selectEndDate(driver, endDate)

    console.log('Select max square') // This assumes that auto-zoom is enabled
    await triggerMapControl(driver, 'View Explorer Max Square', true)

    console.log('Select max cluster')
    // Deselect cluster first if needed and then re-select - this assumes that auto-zoom is enabled
    await triggerMapControl(driver, 'View Explorer Max Cluster', false)
    await triggerMapControl(driver, 'View Explorer Max Cluster', true)
}

async function triggerMapControl(driver, controlTitle, enableControl) {
    const control = await getMapControl(driver, controlTitle)
    const backgroundColor = await control.getCssValue('background-color')
    const expectedColor = enableControl ? 'rgba(187, 187, 187, 1)' : 'rgba(255, 255, 255, 1)'
    if (expectedColor !== backgroundColor) {
        await control.click()
        await sleep(500)
    }
}

async function getMapControl(driver, controlTitle) {
    return await getElementByPath(driver, `//a[contains(@title, '${controlTitle}')]`)
}
