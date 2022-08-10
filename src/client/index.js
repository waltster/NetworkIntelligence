/**
 *
 * Copyright 2022, University of South Carolina. All rights reserved.
 * Released under the license found in LICENSE.md.
 *
 * @date 9 August 2022
 * @author Walter Pach <walterdpach@gmail.com>
 */
import Sigma from 'sigma';
import Graph from 'graphology';
import FA2Layout from "graphology-layout-forceatlas2/worker.js";
import NoverlapLayout from 'graphology-layout-noverlap/worker.js';
import random from 'graphology-layout/random.js';
import ForceSupervisor from 'graphology-layout-force/worker.js';
import chroma from "chroma-js";
import seedrandom from 'seedrandom';
import * as DOM from './DOMHelper.js';

window.renderer = {};
window.state = {searchQuery: ""};

function sortIPAddresses(a, b) {
  const numA = Number(
    a.split('.')
      .map((num, idx) => num * Math.pow(2, (3 - idx) * 8))
      .reduce((a, v) => ((a += v), a), 0)
  );
  const numB = Number(
    b.split('.')
      .map((num, idx) => num * Math.pow(2, (3 - idx) * 8))
      .reduce((a, v) => ((a += v), a), 0)
  );
  return numA - numB;
}

function setSearchQuery(graph, renderer, state, query, searchInput){
  state.searchQuery = query;

  if(searchInput.value !== query){
    searchInput.value = query;
  }

  if(query){
    const lcQuery = query.toLowerCase();
    const suggestions = graph.nodes().map(function(node){
      return {id: node, label: graph.getNodeAttribute(node, "label")}
    }).filter(({ label }) => label.toLowerCase().includes(lcQuery));

    if(suggestions.length === 1 && suggestions[0].label === query){
      state.selectedNode = suggestions[0].id;
      state.suggestions = undefined;

      const nodePosition = renderer.getNodeDisplayData(state.selectedNode);

      renderer.getCamera().animate(nodePosition, {duration: 500});
    }else{
      state.selectedNode = undefined;
      state.suggestions = new Set(suggestions.map(({ id }) => id).sort(sortIPAddresses));
    }
  }else{
    state.selectedNode = undefined;
    state.suggestions = undefined;
  }

  renderer.refresh();
}

window.setHoveredNode = function(state, graph, renderer, node){
    if(state.nodeClicked){
      renderer.refresh();
        return;
    }

    if(node){
        state.hoveredNode = node;
        state.hoveredNeighbors = new Set(graph.neighbors(node));
    }else{
        state.hoveredNode = undefined;
        state.hoveredNeighbors = undefined;
    }

    renderer.refresh();
}

function fetchPCAPData(){
    return new Promise(function(resolve, reject){
        var request = new XMLHttpRequest();

        request.onreadystatechange = function(){
            if(request.status >= 300){
                console.error(`Request error: ${request.status} - ${request.responseText}`);
                reject(request.status);
                return;
            }

            if(request.status < 300 && request.status >= 200 && request.readyState == 4){
                resolve(JSON.parse(request.responseText));
                return;
            }
        };

        request.open('GET', '/pcap', true);
        request.send();
    });
}

function sort(arr){
    var sortedKeys = Object.keys(arr).sort(function(a,b){return arr[a]-arr[b]});

    return sortedKeys;
}

(async function(){
    var rng = seedrandom("networkintelligence");
    const pcap_data = await fetchPCAPData();
    const graph = new Graph();
    const scale = chroma.scale(DOM.heatmap);
    var layouts = {};
    var packetsPerIP = {};

    window.renderer = new Sigma.Sigma(graph, document.getElementById('container'), {
      renderEdgeLabels: true,
      defaultEdgeType: 'edges-fast'
    });

    layouts['seededrandom'] = 'seededrandom';
    layouts['FA2Layout'] = new FA2Layout(graph, {});
    layouts['ForceSupervisor'] = new ForceSupervisor(graph);
    layouts['NoverlapLayout'] = new NoverlapLayout(graph, {margin: 10, speed: 100});

    state.currentLayout = layouts['seededrandom'];

    DOM.init(graph, window.renderer, state, layouts, rng, setSearchQuery, setHoveredNode, packetsPerIP);

    for(var i = 0; i < pcap_data.length; i++){
        var entry = pcap_data[i];

        if(!packetsPerIP[entry.sourceIP]){
            packetsPerIP[entry.sourceIP] = 0;
        }

        if(!packetsPerIP[entry.destinationIP]){
            packetsPerIP[entry.destinationIP] = 0;
        }

        packetsPerIP[entry.sourceIP] += 1;
        packetsPerIP[entry.destinationIP] += 1;

        if(!graph.hasNode(entry.sourceIP)){
            graph.addNode(entry.sourceIP, {size: 20, label: entry.sourceIP});
        }

        if(!graph.hasNode(entry.destinationIP)){
            graph.addNode(entry.destinationIP, {size: 20, label: entry.destinationIP});
        }

        if(!graph.hasEdge(entry.sourceIP, entry.destinationIP)){
            graph.addEdge(entry.sourceIP, entry.destinationIP, {type: 'line', size: 1, weight: 1});
        }else{
            var count = 0;

            graph.updateEdge(entry.sourceIP, entry.destinationIP, function(attributes){
              count = attributes.weight + 1;

              return {
                ...attributes,
                size: Math.min((attributes.size || 0) + 0.25, 5)
              };
            });
        }
    }

    var sortedNodes = {};
    var maxPackets = Math.max.apply(null, Object.values(packetsPerIP));
    var minPackets = Math.min.apply(null, Object.values(packetsPerIP));
    console.log(`${minPackets} ${maxPackets}`);

    graph.nodes().forEach(function(node, i){
        const angle = (i * 2 * Math.PI) / graph.order;
        const degree = graph.degree(node);
        const size = Math.min(Math.max(((1 + packetsPerIP[node]) / (maxPackets - minPackets)) * 100, 1), 100);

        graph.setNodeAttribute(node, "color", `${scale(((packetsPerIP[node] - minPackets) / (maxPackets - minPackets)) * 2).hex()}`);
        graph.setNodeAttribute(node, "size", size);
        graph.setNodeAttribute(node, "x", Math.random() * 1000);
        graph.setNodeAttribute(node, "y", Math.random() * 1000);

        sortedNodes[node] = packetsPerIP[node];
    });

    sortedNodes = sort(sortedNodes).reverse();

    DOM.postInit(graph, window.renderer, state, sortedNodes, sortIPAddresses);

    window.renderer.on('enterNode', function(node){
        setHoveredNode(state, graph, window.renderer, node.node);
    });

    window.renderer.on('leaveNode', function(node){
        setHoveredNode(state, graph, window.renderer, undefined);
    });

    window.renderer.on('clickNode', function(e){
        state.nodeClicked = false;
        setHoveredNode(state, graph, window.renderer, e.node);
        state.nodeClicked = true;
    });

    window.renderer.setSetting('nodeReducer', function(node, data){
      var res = {...data};

      if(state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node){
        res.color = "#f6f6f6";
      }

      if(state.selectedNode === node){
        res.highlighted = true;
      }else if(state.suggestions && !state.suggestions.has(node)){
        res.color = "#f6f6f6";
      }

      return res;
    });

    window.renderer.setSetting('edgeReducer', function(edge, data){
      var res = {...data};

      if(state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)){
        res.hidden = true;
      }

      if(state.suggestions && (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))){
        res.hidden = true;
      }

      return res;
    });

    window.renderer.refresh();
    random.assign(graph, {rng: rng});
})();
