import { until } from 'selenium-webdriver'
import { getElementById } from './locators.js'

export async function prepareMapContainer(driver) {
    // Show map
    await showContainer(driver, 'viewMapCheckBox', 'mapContainer')

    // Hide all other containers in order to maximize view port
    await hideContainer(driver, 'viewTableCheckBox', 'tableContainer')
    await hideContainer(driver, 'viewChartCheckBox', 'chartContainer')
    await hideContainer(driver, 'viewPhotosCheckBox', 'photosContainer')
}

async function showContainer(driver, checkboxId, containerId) {
    const container = await getElementById(driver, containerId)
    const displayed = await container.isDisplayed()
    if (!displayed) {
        const checkbox = await getElementById(driver, checkboxId)
        await checkbox.click()
        await driver.wait(until.elementIsVisible(container))
        console.log(`Container '${containerId}' visible`)
    }
}

async function hideContainer(driver, checkboxId, containerId) {
    const container = await getElementById(driver, containerId)
    const displayed = await container.isDisplayed()
    if (displayed) {
        const checkbox = await getElementById(driver, checkboxId)
        await checkbox.click()
        await driver.wait(until.elementIsNotVisible(container))
        console.log(`Container '${containerId}' hidden`)
    }
}
