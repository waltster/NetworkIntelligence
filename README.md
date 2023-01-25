# Network Intelligence

## Install
1. Install dependencies:
* `build-essential` (or `gcc/g++`)
* `libpcap-dev` (`libpcap` on macOS)
* `make`
* `NodeJS`

```sh
$ npm install
```

2. Convert PCAP to JSON:
```sh
$ node tools/pcap_converter.js INPUT_FILE pcap.json
```

3. Rebuild package:
```sh
$ npm run build
```

4. Start server, open `localhost:3000` in your web browser.
```sh
$ npm run start
```

## Usage
* __Single Click on Node:__ Sticky a node and its neighbors
* __Double Click on Node:__ View reports for a node
* __Single Click off Node:__ Clear current selection, close report view
* __Double Click off Node:__ Zoom in on the area

## Building/Contributing
### Directory Structure
* `dist` - Contains built and minified bundles of the web-facing content.
* `src` - Contains source for the application.
  * `client` - Source for the web app
* `tools` - Utilities and plugins for setting up, configuring, and deploying the
app.

### Live Builds
To run a live build of the application, open one terminal and run the following
command to run a live build server to handle edits and re-load the code as you
edit. Note that the browser window must be refreshed once edits are saved.
```sh
$ npm run watch
```

In a separate terminal, run the following to start the server. The application
will be available at `localhost:3000` by default.
```sh
$ npm run start
```
