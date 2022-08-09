/**
 *
 * Copyright 2022, University of South Carolina. All rights reserved.
 * Released under the license found in LICENSE.md.
 *
 * @date 9 August 2022
 * @author Walter Pach <walterdpach@gmail.com>
 */
import * as pcap_parser from 'pcap-parser';
import pcap from 'pcap';
import fs from 'fs';

function objectifyPacket(packet){
  var ethernetPacket = packet.payload;
  var ipv4Packet = ethernetPacket.payload;
  var sourceAddress = ipv4Packet.saddr.addr.join('.');
  var destinationAddress = ipv4Packet.daddr.addr.join('.');
  var tcpPacket = ipv4Packet.payload;
  var sourcePort = tcpPacket.sport;
  var destinationPort = tcpPacket.dport;

  return {
    sourceIP: sourceAddress,
    sourcePort: sourcePort,
    destinationIP: destinationAddress,
    destinationPort: destinationPort
  };
}

export default function decodePCAP(file){
  return new Promise(function(resolve, reject){
      var packet_array = [];
      var session = pcap.createOfflineSession(file, {filter: 'ip proto \\tcp'});

      if(!session){
        return reject('Could not create session from file');
      }

      session.on('packet', function(raw_packet){
        try{
          var packet = pcap.decode.packet(raw_packet);
          var objectifiedPacket = objectifyPacket(packet);

          packet_array.push(objectifiedPacket);
        }catch(e){
          console.log('Dropped packet for bad option.');
        }
      });

      session.on('complete', function(){
          resolve(packet_array);
      });
  });
}
