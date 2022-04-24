import { sleep } from './sleep.js'
import { until } from 'selenium-webdriver'

/**
 * A robust checkbox clicker.
 * It checks the current state and does nothing if the checkbox already has the target state.
 * Otherwise, it clicks the checkbox and optionally retries until the target state is reached.
 */
export async function clickCheckbox(driver, byLocator, targetState) {
    let attempts = 0
    while (true) {
        try {
            const checkbox = await driver.wait(until.elementLocated(byLocator))
            let isSelected = await checkbox.isSelected()
            // console.log(`---> Checkbox selected: ${isSelected}, target: ${targetState}`)
            if (targetState === isSelected) {
                console.log('---> Checkbox already in target state')
                break
            }
            await checkbox.click()
            // console.log(`---> Clicked, attempt ${attempts + 1}`)
            isSelected = await checkbox.isSelected()
            // console.log('---> Checkbox selected now:', isSelected)
            if (targetState === isSelected) {
                break
            }
        } catch (e) {
            if (++attempts === 10) {
                throw new Error('Checkbox selection failed after 10 attempts')
            }
            // console.log(`---> Checkbox click attempt ${attempts} failed, retrying`)
            await sleep(100) // Sleep a bit for next attempt
        }
    }
}
