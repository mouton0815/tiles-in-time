import jimp from 'jimp'

export async function takeScreenshot(driver, dimensions, label, counter) {
    console.log(`---> Take screenshot of '${label}'`)

    const base64Shot = await driver.takeScreenshot()
    const base64Image = base64Shot.replace(/^data:image\/png;base64,/, '')
    const imageBuffer = Buffer.from(base64Image, 'base64')

    const image = await jimp.read(imageBuffer)
    image.crop(dimensions.x, dimensions.y, dimensions.w, dimensions.h)
    const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK)
    image.print(font, 20, dimensions.h - 50, label)
    const fileName = `screenshots/img${String(counter).padStart(3, '0')}.png`
    await image.writeAsync(fileName)
}