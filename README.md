# Tiles in Time
Are you a [VeloViewer](https://veloviewer.com) addict who persistently tries to increase the number of tiles,
the maximum square, and the maximum cluster? If yes, then this project is for you.

The project provides a [Node.js](https://nodejs.org) script that creates screenshots of the
VeloViewer *Activities* screen for a given range/list of dates.
Each screenshot gets the date of your activity and an optional title.
All screenshots have exactly the same resolution.
That allows you to create a movie showing how your maximum cluster grows over time (more on that below).

![Three example screenshots](example.png "Three example screenshots")

# Modes of Operation
The runner script can take over the entire process: starting Chrome, logging into Strava, preparing the VeloViewer map view, and taking a series of screenshots.
It can also connect to a running Chrome and use the current map settings.
This allows you to control various visibility parameters such as zoom level.

The mode of operation is defined in the `"mode"` field of the config file (config-file options are described below).
The modes in detail are:
* Mode **1**: The runner script opens a new Chrome window (or connects to an existing Chrome if `"chromePort"` is defined in the config file),
  logs into Strava using the credentials read from the config file,
  opens the _Activities_ tab of VeloViewer,
  prepares the map (in particular chooses the proper zoom level),
  and takes the screenshots.
* Mode **2**: This mode assumes that a Chrome instance is running, and that the _Activities_ tab of VeloViewer is opened.
  It prepares the map and takes the screenshots.
* Mode **3**: In this mode nothing is changed on the map. In particular, the zoom level is kept.
  The _Filters_ bar must be open. The runner script immediately starts taking screenshots.
  Mode 3 runs completely offline; the VeloViewer server is not accessed.
  
Note that in modes 2 and 3 the runner script switches to the _Activities_ tab twice, the first time to adjust map settings
on the map toolbar, the second time to take screenshots. This circumvents a VeloViewer (or Leaflet) quirk that changes the
map zoom level after date selections.

# Installation
Make sure [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org/en/download/) are installed on your computer.

```
$ git clone https://github.com/mouton0815/tiles-in-time.git
$ cd tiles-in-time
$ npm install
```
**TODO**: Describe config.json options
**TODO**: Consider another name for "runner script"

# Configuration
Before you can run the script, you need to create a custom configuration:

```
$ cp config.json.example config.json
```
| Config key | Description                                                                                                                                                                                                                                                                                  | Example                          |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|
| mode       | See section "Modes of Operation" above                                                                                                                                                                                                                                                       | "mode": 2                        |
| chromePort | The debug port of a running Chrome to connect to                                                                                                                                                                                                                                             | "chromePort": 9222               |
| username   | Your Strava user name (email address)                                                                                                                                                                                                                                                        | "username": "my-strava-username" |
| password   | Your Strava password                                                                                                                                                                                                                                                                         | "password": "my-secret-password" |
| startDate  | The date of the first screenshot.<br/>If a "dates" array is present, "startDate" limits the selection to all dates equal or greater than "startDate".<br/>Otherwise, the runner script creates a screenshot for the 1st of every month, starting with the year and month of "startDate".     | "startDate": "2022-02-01"        |
| endDate    | The date of the last screenshot.<br/>If a "dates" array is present, "endDate" limits the selection to all dates smaller or equal than the value of "endDate".<br/>Otherwise, the runner script creates a screenshot for the 1st of every month, ending with the year and month of "endDate". | "endDate": "2022-05-01"          |
| dates | An array of dates of the form "yyyy-mm-dd", optionally followed by a route title.                                                                                                                                                                                                            | "dates": [<br/>  "2022-02-01 First ride",<br/>  "2022-03-13",<br/>  "2022-03-15 Winter is back"<br/>]|
