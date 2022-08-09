import decodePCAP from './src/pcap_converter.js';
import fs from 'fs';
import {E_400, E_404, E_500} from './src/standard_response.js';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PCAP_FILE = 'data.pcap';
const app = express();
const port = 3000;

app.get('/', function(req, res){
    return res.sendFile(__dirname + '/src/client/index.html');
});

app.get('/app.js', function(req, res){
    res.sendFile(__dirname + '/dist/app.js');
});

app.get('/pcap', async function(req, res){
/*    try{
        var pcap_array = await decodePCAP(DEFAULT_PCAP_FILE);

        if(!pcap_array || pcap_array.length <= 0){
            console.error('Error: No packets found in capture decoding.');
            return res.status(500).json(E_500);
        }

        return res.json(pcap_array);
    }catch(e){
        console.error(`Error in processing packet capture: ${e}`);
        res.status(500).json(E_500);
    }*/
    res.sendFile(__dirname + '/pcap.json');
});

app.listen(port, function(){
    console.log(`Listening on port ${port}. View page at: http://localhost:${port}`);
});
