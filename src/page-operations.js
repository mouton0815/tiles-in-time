import { until } from 'selenium-webdriver'
import { sleep } from './sleep.js'
import { prepareMapContainer } from './container-operations.js'
import { openFilters } from './filter-operations.js'
import { disableAutoZoom, prepareMap } from './map-operations.js'
import { getElementByPath } from './locators.js'

export async function loadPage(driver) {
    // Load page and wait for title
    await driver.get('https://veloviewer.com')
    await driver.wait(until.titleContains('VeloViewer'))
    console.log('---> Page loaded')
}

export async function preparePage(driver) {
    await openActivitiesTab(driver)
    await prepareMapContainer(driver)
    await disableAutoZoom(driver)
    await openFilters(driver)
    await prepareMap(driver)
}

async function openActivitiesTab(driver) {
    // Click on the "activities" menu entry
    const activitiesTab = await getElementByPath(driver, '//ul[@id="myTabs"]/li/a[contains(@href, "/activities")]')
    await activitiesTab.click()
    console.log('---> Activities opened')
    await sleep(3000) // Let the filters bar collapse automatically // TODO: Can this be done better?
}
