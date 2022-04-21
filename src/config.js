import fs from 'fs'

export function readConfig() {
    const { username, password, chromePort, dates, startDate, endDate } = JSON.parse(fs.readFileSync('./config.json'))
    const datesArray = createDatesArray(dates, startDate, endDate)
    return { username, password, chromePort, dates: datesArray }
}

/**
 * Reads the config file and returns an array of date strings with optional tour titles.
 * If a start or end date is given, selects that range from the array. If both start and end date
 * is given, but no array, then the array is created by adding a date for the 1st of every month
 * in the date range.
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
                // Because all dates are ISO 8601 dates, we can use string comparison
                if (startDate <= dates[index]) {
                    startIndex = index
                    break
                }
            }
        }
        let endIndex = dates.length
        if (endDate) {
            for (let index = dates.length - 1; index >= 0; index--) {
                if (endDate >= dates[index]) {
                    endIndex = index + 1
                    break
                }
            }
        }
        return dates.slice(startIndex, endIndex)

    } else if (startDate && endDate) {
        // The date list will be generated from range [startDate, endDate]
        let dates = []
        const [startYear, startMonth] = splitDate(startDate)
        const [endYear, endMonth] = splitDate(endDate)
        if (startYear === endYear) {
            // Generate dates from start to end month, including, always using the 1st day of month
            if (startMonth > endMonth) {
                errorExit('Start month must be smaller than end month')
            }
            for (let month = startMonth; month <= endMonth; month++) {
                dates.push(formatDate(startYear, month))
            }
        } else {
            // Generate dates for the start year, all full years, and the end year
            if (startYear > endYear) {
                errorExit('Start year must be smaller than end year')
            }
            for (let month = startMonth; month <= 12; month++) {
                dates.push(formatDate(startYear, month))
            }
            for (let year = startYear + 1; year < endYear; year++) {
                for (let month = 1; month <= 12; month++) {
                    dates.push(formatDate(year, month))
                }
            }
            for (let month = 1; month <= endMonth; month++) {
                dates.push(formatDate(endYear, month))
            }
        }
        return dates

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

function errorExit(message) {
    console.error(message)
    process.exit(-1)
}