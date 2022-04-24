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
    await openTab(driver, 'activities', 3000)
    await prepareMapContainer(driver)
    await disableAutoZoom(driver)

    // There is a really strange VeloViewer bug: When the "Map Settings" modal window was opened once (to e.g.
    // disable the auto zoom as done above), then the selection of certain routes leads to strange zoom-in effects.
    // One way to avoid this is to open another tab (here: "update") after closing the modal window and then to
    // return to the "activities" tab again.
    await openTab(driver, 'update', 2000)
    await openTab(driver, 'activities', 3000)

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

async function openUpdateTab(driver) {
    // Click on the "activities" menu entry
    const activitiesTab = await getElementByPath(driver, '//ul[@id="myTabs"]/li/a[contains(@href, "/update")]')
    await activitiesTab.click()
    console.log('---> Update opened')
    await sleep(3000) // Let the filters bar collapse automatically // TODO: Can this be done better?
}

async function openTab(driver, tab, delay) {
    const activitiesTab = await getElementByPath(driver, `//ul[@id="myTabs"]/li/a[contains(@href, "/${tab}")]`)
    await activitiesTab.click()
    console.log(`---> Tab '${tab}' opened`)
    await sleep(delay) // Let the filters bar collapse automatically // TODO: Can this be done better?
}