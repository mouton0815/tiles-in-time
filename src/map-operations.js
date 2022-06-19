import {By, Key, until} from 'selenium-webdriver'
import { isoToUkDate, sleep } from './utils.js'
import { openFilters, selectEndDate} from './filter-operations.js'
import { getElementByClassName, getElementById, getElementByPath } from './locators.js'
import { clickCheckbox } from './checkbox.js'

export async function getMapDimensions(driver) {
    const container = await getElementById(driver, 'mapContainer')
    const viewPort = await container.getRect()
    console.log('Use screenshot viewport', viewPort)
    const dimensions = {
        x: Math.ceil(viewPort.x),
        y: Math.ceil(viewPort.y),
        w: Math.floor(viewPort.width / 2) * 2, // Sigh, ffmpeg requires width/height divisible by 2
        h: Math.floor(viewPort.height / 2) * 2
    }
    console.log('Use screenshot viewport', dimensions)
    return dimensions
}

export async function applyMapSettings(driver, routeVisibility) {
    const mapControlButton = await getMapControl(driver, 'Map settings')
    await mapControlButton.click()

    // Disable auto-zoom
    await clickCheckbox(driver, By.id('mapAutoZoomCheckBox'), false)
    console.log('Auto zoom disabled')
    await sleep(500)

    // Set the opacity slider to value where routes are not shown (0), slightly shown (1), or clearly shown (3).
    // It seems there iss no other way to move the slider *and* trigger map actions other than moving the mouse.
    // Failing attempts were
    // - opacitySlider.sendKeys('value', '0.1') (no visible reaction)
    // - opacitySlider.sendKeys('value', Key.LEFT) (the map moves but the slider does not)
    // - driver.executeScript('arguments[0].setAttribute("value", arguments[1])', opacitySlider, '0.1') (no reaction)
    // - driver.executeScript('arguments[0].stepDown()', opacitySlider) (slider moves but route opacity does not change)
    const opacitySlider = await getElementByClassName(driver, 'lm_opacitySlider')
    const sliderOffset = getSliderOffset(routeVisibility)
    const actions = driver.actions()
    await actions.dragAndDrop(opacitySlider, { x: sliderOffset, y: 0 }).perform()
    console.log(`Opacity slider set to position ${routeVisibility/10} of 1`)
    await sleep(500) // Do not close modal window too fast

    const closeButton = await getElementByPath(driver, '//button[text()="Close"]')
    await closeButton.click()
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

function getSliderOffset(routeVisibility) {
    // The proper slider offsets (in pixels) have been detected by trial and error.
    switch (routeVisibility) {
        case 0: return -40
        case 1: return -30
        case 2: return -25
    }
}