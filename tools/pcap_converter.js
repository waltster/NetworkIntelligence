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
      var i = 0;

      if(!session){
        return reject('Could not create session from file');
      }

      session.on('packet', function(raw_packet){
        try{
          var packet = pcap.decode.packet(raw_packet);
          var objectifiedPacket = objectifyPacket(packet);

          packet_array.push(objectifiedPacket);
        }catch(e){
          i++;
        }
      });

      session.on('complete', function(){
          console.log(`Dropped ${i} packets total.`);
          resolve(packet_array);
      });
  });
}

(async function(){
  var argv = process.argv.splice(2);

  if(argv.length <= 1){
    console.log('Error: must provide [input] [output] arguments');
    process.exit(1);
  }

  var infile = argv[0];
  var outfile = argv[1];

  console.log(`Beginning to decode file ${infile} -> ${outfile}`);
  var pcapData = await decodePCAP(infile);

  fs.writeFile(outfile, JSON.stringify(pcapData, null, 2), function(a){
    if(a){
      console.log(`Error: ${a}`);
    }else{
      console.log(`File ${outfile} written. ${pcapData.length} packets decoded.`);
    }
  });
})();
