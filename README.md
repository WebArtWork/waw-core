# Core
Core [waw](https://webart.work) commands which will be useful on any kind of project.

## Runners
### Generate new project from waw list of repo's
`waw new PROJECT_NAME REPO_LINK BRANCH`<br>
`waw new`<br>
`waw n`
### Generate new part
`waw add PART_NAME REPO_LINK BRANCH`<br>
`waw add`<br>
`waw a`
### Get waw framework version and versions of all accessible parts
`waw --version`<br>
`waw --v`<br>
`waw version`<br>
`waw v`
### Start pm2 server
`waw start`
### Stop pm2 server
`waw stop`
### Restart pm2 server
`waw restart`

## waw Script
### Object which forms from config.json plus server.json if such exists
`waw.config`
### Parallel allow you to execute many different kind of async requests and after all finish you can run the final callback.
`waw.parallel([ function(next){ next() }, function(next){ next() }], function(){ //end })`
### Serial execute an array of functions one by one
`waw.serial(arr, callback)`
### Each accept an array or an object, parse each by one functiona and execute callback when that is finished, by isSerial=true you will make those parses by serial
`waw.each(arrOrObj, func, callback, isSerial)`
### Data Url To Location take an dataUrl content and make it local file
`waw.dataUrlToLocation(dataUrl, folder, file, callback)`
### Exe execute an terminal command within code
`waw.exe(command, callback)`

## Contributing
Thanks for your interest in contributing! Read up on our guidelines for
[contributing](https://github.com/WebArtWork/core/CONTRIBUTING.md)
and then look through our issues with a [help wanted](https://github.com/WebArtWork/core/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)
label.