# Tiles in Time
Are you a [VeloViewer](https://veloviewer.com) addict who persistently tries to increase the number of tiles,
the maximum square, and the maximum cluster? If yes, then this project is for you.

The project provides a [Node.js](https://nodejs.org) app that creates screenshots of the
VeloViewer *Activities* screen for a given range/list of dates.
Each screenshot gets the date of your activity and an optional title.
All screenshots have exactly the same resolution.
That allows you to create a movie showing how your maximum cluster grows over time (more on that below).

![Three example screenshots](example.png "Three example screenshots")

# Modes of Operation
The app can take over the entire process: starting Chrome, logging into Strava, preparing the VeloViewer map view, and taking a series of screenshots.
It can also connect to a running Chrome and use the current map settings.
This allows you to control various visibility parameters such as zoom level.

The mode of operation is defined in the `"mode"` field of the config file (config-file options are described below).
The modes in detail are:
* Mode **1**: The app opens a new Chrome window (or connects to an existing Chrome if `"chromePort"` is defined in the config file),
  logs into Strava using the credentials read from the config file,
  opens the _Activities_ tab of VeloViewer,
  prepares the map (in particular chooses the proper zoom level),
  and takes the screenshots.
* Mode **2**: This mode assumes that a Chrome instance is running, and that the _Activities_ tab of VeloViewer is opened.
  It prepares the map and takes the screenshots.
* Mode **3**: In this mode nothing is changed on the map. In particular, the zoom level is kept.
  The _Filters_ bar must be open. The app immediately starts taking screenshots.
  Mode 3 runs completely offline; the VeloViewer server is not accessed.
  
Note that in modes 2 and 3 the app switches to the _Activities_ tab twice, the first time to adjust map settings
on the map toolbar, the second time to take screenshots. This circumvents a VeloViewer (or Leaflet) quirk that changes the
map zoom level after date selections.

# Installation
Make sure [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org/en/download/) are installed on your computer.

```
git clone https://github.com/mouton0815/tiles-in-time.git
cd tiles-in-time
npm install
```

# Configuration
Before you can run the app, you need to create a custom configuration:

```
cp config.json.example config.json
```
| Config key | Description                                                                                                                                                                                                                                                                        | Example                                                                                           |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| mode       | See section "Modes of Operation" above.                                                                                                                                                                                                                                            | "mode": 2                                                                                         |
| chromePort | The debug port of a running Chrome to connect to.<br/>This key is optional for mode 1 and required for modes 2 and 3.                                                                                                                                                              | "chromePort": 9222                                                                                |
| username   | Your Strava user name (email address).                                                                                                                                                                                                                                             | "username": "my-strava-username"                                                                  |
| password   | Your Strava password.                                                                                                                                                                                                                                                              | "password": "my-secret-password"                                                                  |
| dates      | An array of dates of the form "yyyy-mm-dd", optionally followed by a route title.                                                                                                                                                                                                  | "dates": [<br/>  "2022-03-01 First ride",<br/>  "2022-03-13",<br/>  "2022-03-15 A nice one"<br/>] |
| startDate  | The date of the first screenshot.<br/>If a "dates" array is present, "startDate" limits the selection to all dates equal or greater than "startDate".<br/>Otherwise, the app creates a screenshot for the 1st of every month, starting with the year and month of "startDate".     | "startDate": "2022-02-01"                                                                         |
| endDate    | The date of the last screenshot.<br/>If a "dates" array is present, "endDate" limits the selection to all dates smaller or equal than the value of "endDate".<br/>Otherwise, the app creates a screenshot for the 1st of every month, ending with the year and month of "endDate". | "endDate": "2022-05-01"                                                                           |

A minimal configuration for the creation of three screenshots on a running Chrome browser could be:
```json
{
  "mode": 3,
  "chromePort": 9222,
  "dates": [
    "2022-03-01 First ride",
    "2022-03-15",
    "2022-03-17 A nice one"
  ]
}
```

# Running
If you use mode 1 and let the app open a Chrome browser (i.e. you do _not_ specify a value for `"cromePort"`), then simply type
```
npm start
```
Otherwise, you need to start a Chrome browser with remote debugging enabled.
It is also recommended to use a dedicated directory for user data.
On Windows, open a PowerShell and run
```
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --remote-debugging-port=9222 --user-data-dir='C:\tmp\ChromeProfile'
```
Then run the app with
```
npm start
```
The app will output some logging information to the console and save the screenshots in folder [screenshots](./screenshots).

# Creating a Movie
A good tool to make a movie from the series of screenshots is [FFmeg](https://ffmpeg.org/).
Various options to create a slideshow are described [here](https://trac.ffmpeg.org/wiki/Slideshow).
An example call is
```
C:\Tools\ffmpeg-n5.0\bin\ffmpeg.exe -framerate 0.5 -i screenshots\img%03d.png -c:v libx264 -vf fps=25 -pix_fmt yuv420p out.mp4
```
