import fs from 'fs'
import { errorExit } from './utils.js'

export function readConfig() {
    const { mode = 2, username, password, chromePort, dates, startDate, endDate } = JSON.parse(fs.readFileSync('./config.json'))
    if (mode > 1 && !chromePort) {
        errorExit(`Mode ${mode} requires "chromePort" to be defined (i.e. connect to a running Chrome)`)
    }
    const datesArray = createDatesArray(dates, startDate, endDate)
    return { mode, username, password, chromePort, dates: datesArray }
}

/**
 * Reads the config file and returns an array of date strings with optional tour titles.
 * If a start or end date is given, selects that range from the array. If both start and end date
 * is given, but no array, then the array is created by adding a date for the 1st of every month
 * in the date range. It is guaranteed that the returned array is non-empty.
 */
function createDatesArray(dates, startDate, endDate) {
    // TODO: More correctness checks (including syntax of all date strings)
    if (dates) {
        // The list of dates is explicitly given
        if (!Array.isArray(dates) || dates.length === 0) {
            errorExit('Option "dates" must be a non-empty array')
        }

        let startIndex = 0
        if (startDate) {
            for (let index = 0; index < dates.length; index++) {
                const [date] = dates[index].split(' ') // Chop-off the optional tour name
                if (startDate <= date) { // Because all dates are ISO 8601 dates, we can use string comparison
                    startIndex = index
                    break
                }
            }
        }
        let endIndex = dates.length
        if (endDate) {
            for (let index = dates.length - 1; index >= 0; index--) {
                const [date] = dates[index].split(' ')
                if (endDate >= date) {
                    endIndex = index + 1
                    break
                }
            }
        }
        const dateList = dates.slice(startIndex, endIndex)
        if (dateList.length === 0) {
            errorExit('The "startDate" - "endDate" range yields an empty list')
        }
        return dateList

    } else if (startDate && endDate) {
        // The date list will be generated from range [startDate, endDate]
        const dateList = []
        const [startYear, startMonth] = splitDate(startDate)
        const [endYear, endMonth] = splitDate(endDate)
        if (startYear === endYear) {
            // Generate dates from start to end month, including, always using the 1st day of month
            if (startMonth > endMonth) {
                errorExit('Start month must be smaller than end month')
            }
            for (let month = startMonth; month <= endMonth; month++) {
                dateList.push(formatDate(startYear, month))
            }
        } else {
            // Generate dates for the start year, all full years, and the end year
            if (startYear > endYear) {
                errorExit('Start year must be smaller than end year')
            }
            for (let month = startMonth; month <= 12; month++) {
                dateList.push(formatDate(startYear, month))
            }
            for (let year = startYear + 1; year < endYear; year++) {
                for (let month = 1; month <= 12; month++) {
                    dateList.push(formatDate(year, month))
                }
            }
            for (let month = 1; month <= endMonth; month++) {
                dateList.push(formatDate(endYear, month))
            }
        }
        if (dateList.length === 0) {
            errorExit('The "startDate" - "endDate" range yields an empty list')
        }
        return dateList

    } else {
        errorExit('Invalid config file (either "dates" or both "startDate" and "endDate" must be provided)')
    }
}

function splitDate(dateString) {
    const [yearStr, monthStr] = dateString.split('-')
    return [parseInt(yearStr), parseInt(monthStr)]
}

function formatDate(year, month) {
    return `${year}-${String(month).padStart(2, '0')}-01`
}
