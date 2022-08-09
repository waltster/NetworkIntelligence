# Network Intelligence

## Install
1. Install dependencies:
```sh
$ sudo apt install libpcap-dev # Linux
$ brew install libpcap-dev     # macOS
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
