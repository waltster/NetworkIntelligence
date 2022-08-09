# NetworkIntelligence Mapper

1. Install dependencies:
```sh
$ sudo apt install libpcap-dev # Linux
$ brew install libpcap-dev     # macOS
$ npm install
```

2. Convert PCAP to JSON:
```sh
$ node tools/pcapconverter.js INPUT_FILE pcap.json
```

3. Rebuild package:
```sh
$ npm run build
```

4. Start server, open `localhost:3000` in your web browser.
```sh
$ npm run start
```
