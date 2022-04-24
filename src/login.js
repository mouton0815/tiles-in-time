import { until } from 'selenium-webdriver'
import { sleep } from './sleep.js'
import { getElementById, getElementByPath } from './locators.js'

export async function login(driver, username, password) {
    const updateButton = await getElementByPath(driver, '(//a[@href="/update"])[1]')
    console.log('---> Update button located')
    await updateButton.click()

    // VeloViewer now routes to Strava
    await driver.wait(until.titleContains('Strava'))
    const usernameField = await getElementById(driver, 'email')
    await usernameField.sendKeys(username)
    await sleep(1000) // TODO: Reconsider waiting
    const passwordField = await getElementById(driver, 'password')
    await passwordField.sendKeys(password)
    await sleep(1000) // TODO: Reconsider waiting
    const loginButton = await getElementById(driver, 'login-button')
    await loginButton.click()

    await driver.wait(until.titleContains('VeloViewer'))
    console.log('---> Returned to VeloViewer')
}