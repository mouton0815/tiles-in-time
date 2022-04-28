import { By, until } from 'selenium-webdriver'
import { getElementById } from './locators.js'
import { clickCheckbox } from './checkbox.js'


export async function openFilters(driver) {
    const filterExpander = await getElementById(driver,'filtersExpander')
    await filterExpander.click()
    console.log('---> FilterExpander clicked')
    const collapseFilter = await getElementById(driver, 'collapseFilter')
    await driver.wait(until.elementIsVisible(collapseFilter))
    console.log('---> Filters visible')
}

export async function closeFilters(driver) {
    const filterExpander = await getElementById(driver, 'filtersExpander')
    await filterExpander.click()
    // console.log('---> FilterExpander clicked')
    const collapseFilter = await getElementById(driver, 'collapseFilter')
    await driver.wait(until.elementIsNotVisible(collapseFilter))
    // console.log('---> Filter invisible')
}

export async function selectEndDate(driver, dateStr) {
    const dateField = await getElementById(driver, 'max0')
    await dateField.clear()
    await dateField.sendKeys(dateStr)

    // Due to a VeloViewer bug, the maximum cluster is sometimes not colored correctly.
    // De- and then re-selecting the "Ride" checkbox corrects this.
    await clickRideCheckbox(driver, false)
    await clickRideCheckbox(driver, true)
}

async function clickRideCheckbox(driver, targetState) {
    await clickCheckbox(driver, By.xpath('//input[@value="Ride"]'), targetState)
}
