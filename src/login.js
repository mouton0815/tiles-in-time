import { By, until } from 'selenium-webdriver'
import { sleep } from './utils.js'
import { getElementById } from './locators.js'

export async function login(driver, username, password) {
    const updateButtons = await driver.findElements(By.xpath('//a[./strong[text()="Log In"]]'))
    if (updateButtons.length === 0) {
        console.log('---> No Login button found, already logged in')
    } else {
        console.log('---> Login button located')
        await updateButtons[0].click()
        try {
            // VeloViewer now routes to Strava
            await driver.wait(until.titleContains('Strava'), 2000)

            const usernameField = await getElementById(driver, 'email')
            await usernameField.sendKeys(username)
            await sleep(1000) // Wait to simulate human behavior
            const passwordField = await getElementById(driver, 'password')
            await passwordField.sendKeys(password)
            await sleep(1000)
            const loginButton = await getElementById(driver, 'login-button')
            await loginButton.click()
            console.log('---> Credentials submitted')

        } catch (e) {
            if (e.name === 'TimeoutError') {
                console.log('---> No Login page found, already logged in')
            } else {
                throw e
            }
        }

        await driver.wait(until.titleContains('VeloViewer'))
        console.log('---> Returned to VeloViewer')
    }
}