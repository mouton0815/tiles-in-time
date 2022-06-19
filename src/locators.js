import { By, until } from 'selenium-webdriver'

export async function getElementById(driver, id) {
    return await driver.wait(until.elementLocated(By.id(id)))
}

export async function getElementByClassName(driver, className) {
    return await driver.wait(until.elementLocated(By.className(className)))
}

export async function getElementByPath(driver, path) {
    return await driver.wait(until.elementLocated(By.xpath(path)))
}
