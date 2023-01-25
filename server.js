/**
 *
 * Copyright 2022, University of South Carolina. All rights reserved.
 * Released under the license found in LICENSE.md.
 *
 * @date 9 August 2022
 * @author Walter Pach <walterdpach@gmail.com>
 */
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

app.get('/app.css', function(req, res){
    res.sendFile(__dirname + '/dist/app.css');
});

app.get('/pcap', async function(req, res){
    res.sendFile(__dirname + '/pcap.json');
});

app.listen(port, function(){
    console.log(`Listening on port ${port}. View page at: http://localhost:${port}`);
});
