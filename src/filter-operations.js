import { By, until } from 'selenium-webdriver'
import { errorExit } from './utils.js'
import { getElementById } from './locators.js'
import { clickCheckbox } from './checkbox.js'


export async function openFilters(driver) {
    const dateField = await getElementById(driver, 'max0')
    if (await dateField.isDisplayed()) {
        console.log('---> Filters toolbar is already open')
        return
    }
    const filterExpander = await getElementById(driver,'filtersExpander')
    await filterExpander.click()
    const collapseFilter = await getElementById(driver, 'collapseFilter')
    await driver.wait(until.elementIsVisible(collapseFilter))
    console.log('---> Filters toolbar opened')
}

export async function selectEndDate(driver, dateStr) {
    const dateField = await getElementById(driver, 'max0')
    if (!(await dateField.isDisplayed())) {
        errorExit('Date field is not visible (please click on "Show Filters" to open the toolbar)')
    }
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
