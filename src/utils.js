import fs from 'fs'
import { dirname, normalize } from 'path'
import { fileURLToPath } from 'url'

export async function sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time))
}

export function isoToUkDate(isoDate) {
    const [date] = isoDate.split(' ') // Chop-off the optional tour name
    const [year, month, day] = date.split('-', 3)
    return `${month}/${day}/${year}`
}

export function createFolder(name) {
    const folder = dirname(fileURLToPath(import.meta.url))
    const path = normalize(folder + '/../' + name)
    console.log('--->', path)
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
    }
}
