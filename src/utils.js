import fs from 'fs'
import { dirname, normalize } from 'path'
import { fileURLToPath } from 'url'

export async function sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time))
}

export function errorExit(message) {
    console.error(message)
    process.exit(-1)
}

export function extractDate(isoDateLine) {
    const [date] = isoDateLine.split(' ') // Chop-off the optional tour name
    return date
}

export function isoToUkDate(isoDateLine) {
    const date = extractDate(isoDateLine)
    const [year, month, day] = date.split('-', 3)
    return `${month}/${day}/${year}`
}

export function createFolder(name) {
    const folder = dirname(fileURLToPath(import.meta.url))
    const path = normalize(folder + '/../' + name)
    if (!fs.existsSync(path)) {
        console.log('Create folder', path)
        fs.mkdirSync(path)
    }
}
