// chrome --remote-debugging-port=9222 --user-data-dir="C:\tmp\ChromeProfile"

import 'chromedriver'
import chrome from 'selenium-webdriver/chrome.js'
import  { Builder, WebElementCondition, By, Key, until } from 'selenium-webdriver'
import fs from 'fs'

const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().debuggerAddress('127.0.0.1:9222'))
    .build()

try {
    await driver.get('https://veloviewer.com')
    await driver.wait(until.titleContains('VeloViewer'), 3000)
    /*
    const y = await driver.findElement(By.id('myTabs'))
    console.log('--->', y)
    console.log('--->', await y.isDisplayed())
    */
    /*
    const xx = await driver.findElements(By.xpath('//ul/li/a[@href="/athlete/22548864/activities"]'))
    for (const x of xx) {
        console.log('--->', x)
        console.log('--->', await x.isDisplayed())
    }
     */
    // TODO: Why are those multiple "/activities" hrefs??
    await driver.findElement(By.xpath('(//a[contains(@href, "/activities")])[2]')).click()
    await sleep(3000) // TODO: Wait for element - which?

    const mapVisibility = await driver.findElement(By.id('mapContainer')).getCssValue("display")
    console.log('--mapVisibility-->', mapVisibility)
    if ('none' === mapVisibility) {
        await driver.findElement(By.id('viewMapCheckBox')).click()
        await sleep(2000)
    }
    /*
    // TODO: Strange behavior -- need to figure out which button is selected
    await driver.findElement(By.id('viewTableCheckBox')).click()
    await sleep(1000)
     */

    const photosControl = await driver.findElement(By.xpath('//a[@title="View photos"]'))
    const photosControlColor = await photosControl.getCssValue("background-color")
    console.log('--photos-->', photosControlColor)
    if ('rgba(187, 187, 187, 1)' === photosControlColor ) {
        console.log('--photos--> CLICK')
        await photosControl.click()
        await sleep(1000)
    }

    const clusterControl = await driver.findElement(By.xpath('//a[contains(@title, "View Explorer Max Cluster")]'))
    const clusterControlColor = await clusterControl.getCssValue("background-color")
    console.log('--cluster-->', clusterControlColor)
    if ('rgba(255, 255, 255, 1)' === clusterControlColor ) {
        console.log('--cluster--> CLICK')
        await clusterControl.click()
        await sleep(1000)
    }


    /*
    await driver.findElement(By.xpath('//a[@title="View photos"]')).click()
    await sleep(2000)
    await driver.findElement(By.xpath('//a[@title="View Explorer Max Cluster"]')).click()
    await sleep(2000)
     */

    const data = await driver.takeScreenshot()
    const base64Data = data.replace(/^data:image\/png;base64,/,"")
    fs.writeFile("out.png", base64Data, 'base64', function(err) {
        if(err) console.log(err)
    })

} finally {
    await driver.quit()
}

async function sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time))
}