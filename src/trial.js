import chrome from 'chromedriver'
import chrome from 'chromedriver'
import  { Builder, By, Key, until } from 'selenium-webdriver'

const driver = await new Builder().forBrowser('chrome').build()
// console.log('--->', driver.command_executor._url)
console.log('--->', driver)
try {
    /*
    await driver.get('https://veloviewer.com')
    await driver.wait(until.titleContains('VeloViewer'), 3000)
    await sleep(1000)
    const z = await driver.findElement(By.xpath('(//a[@href="/update"])[1]'))
    console.log('-/->', z)
    console.log('-/->', await z.isDisplayed())
    await driver.findElement(By.xpath('(//a[@href="/update"])[1]')).click()
    await driver.wait(until.titleContains('Strava'), 3000)
    await sleep(1000)
    await driver.findElement(By.className('btn-accept-cookie-banner')).click()
    await sleep(1000)
    await driver.findElement(By.id('email')).sendKeys('torsten.schlieder@gmx.net')
    await sleep(1000)
    await driver.findElement(By.id('password')).sendKeys('55mouton89')
    await sleep(1000)
    await driver.findElement(By.id('login-button')).click()
    await driver.wait(until.titleContains('VeloViewer'), 3000)
    await sleep(1000)
    const x = await driver.findElement(By.xpath('//a[@href="/athlete/22548864/activities"]'))//.click()

    //const x = await driver.findElement(By.xpath('//ul/li/a[contains(@href, "/activities")]'))//.click()
    console.log('--->', x)
    console.log('--->', await x.isDisplayed())
    */

    await sleep(3000)

    //await new Promise(resolve => setTimeout(resolve, 3000));
    // cy.get('a[href*="/update').first().click()

    // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
    ///await driver.wait(until.titleIs('webdriver - Google Search'), 1000)
} finally {
    await driver.quit()
}

async function sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time))
}