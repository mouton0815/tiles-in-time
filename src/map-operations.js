import { By } from 'selenium-webdriver'
import { sleep } from './sleep.js'
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
    await sleep(1000) // Do not close modal window too fast TODO: Necessary?

    const closeButton = await getElementByPath(driver, '//button[text()="Close"]')
    await closeButton.click()
    await sleep(1000) // Do not close modal window too fast TODO: Necessary?
}

export async function prepareMap(driver) {
    // Deselect photos on map
    await triggerMapControl(driver, 'View photos', false)

    // Select max square (TODO: This assumes that auto-zoom is enabled)
    await triggerMapControl(driver, 'View Explorer Max Square', true)

    // Select max cluster. Deselect it first if needed and then re-select (TODO: This assumes that auto-zoom is enabled)
    await triggerMapControl(driver, 'View Explorer Max Cluster', false)
    await triggerMapControl(driver, 'View Explorer Max Cluster', true)
}

async function triggerMapControl(driver, controlTitle, enableControl) {
    const control = await getMapControl(driver, controlTitle)
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

async function getMapControl(driver, controlTitle) {
    return await getElementByPath(driver, `//a[contains(@title, '${controlTitle}')]`)
}
