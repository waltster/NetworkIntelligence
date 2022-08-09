import Sigma from 'sigma';
import Graph from 'graphology';
import FA2Layout from "graphology-layout-forceatlas2/worker.js";
import NoverlapLayout from 'graphology-layout-noverlap/worker.js';
import fa2 from "graphology-layout-forceatlas2";
import forceLayout from "graphology-layout-force";
import * as EdgesDefaultProgram from 'sigma/rendering/webgl/programs/edge.js';
import * as EdgesFastProgram from 'sigma/rendering/webgl/programs/edge.fast.js';
import random from 'graphology-layout/random.js';
import ForceSupervisor from 'graphology-layout-force/worker.js';
import chroma from "chroma-js";
import seedrandom from 'seedrandom';
import * as DOM from './DOMHelper.js';

function addRed(hex){
    if(!hex){
      hex = 0;
    }

    var num = parseInt(hex, 16);
    var red = (num & 0xFF0000) >>> 16;
    var green = (num & 0x00FF00) >>> 8;
    var blue = (num & 0xFF);

    red += 10;
    green += 5;
    blue += 5;

    var rgb = (red << 16) + (green << 8) + blue;

    return rgb.toString(16);
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
      state.suggestions = new Set(suggestions.map(({ id }) => id));
    }
  }else{
    state.selectedNode = undefined;
    state.suggestions = undefined;
  }

  renderer.refresh();
}

function setHoveredNode(state, graph, renderer, node){
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
    var state = {searchQuery: ""};
    var layouts = {};

    const renderer = new Sigma.Sigma(graph, container, {
      renderEdgeLabels: true,
      defaultEdgeType: 'edges-fast'
    });

    layouts['seededrandom'] = 'seededrandom';
    layouts['FA2Layout'] = new FA2Layout(graph, {});
    layouts['ForceSupervisor'] = new ForceSupervisor(graph);
    layouts['NoverlapLayout'] = new NoverlapLayout(graph, {margin: 10, speed: 100});

    state.currentLayout = layouts['seededrandom'];

    DOM.init(graph, renderer, state, layouts, rng, setSearchQuery);

    for(var i = 0; i < pcap_data.length; i++){
        var entry = pcap_data[i];

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

    graph.nodes().forEach(function(node, i){
        const angle = (i * 2 * Math.PI) / graph.order;
        const degree = graph.degree(node);
        const size = Math.min(((1 + degree) / (100)) * 50, 300);

        //graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
        //graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));
        graph.setNodeAttribute(node, "color", `${scale(degree / graph.order * 40).hex()}`);
        graph.setNodeAttribute(node, "size", size);
        graph.setNodeAttribute(node, "x", Math.random() * 1000);
        graph.setNodeAttribute(node, "y", Math.random() * 1000);

        sortedNodes[node] = degree;
    });

    sortedNodes = sort(sortedNodes).reverse();

    DOM.postInit(graph, renderer, state, sortedNodes);

    renderer.on('enterNode', function(node){
        setHoveredNode(state, graph, renderer, node.node);
    });

    renderer.on('leaveNode', function(node){
        setHoveredNode(state, graph, renderer, undefined);
    });

    renderer.setSetting('nodeReducer', function(node, data){
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

    renderer.setSetting('edgeReducer', function(edge, data){
      var res = {...data};

      if(state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)){
        res.hidden = true;
      }

      if(state.suggestions && (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))){
        res.hidden = true;
      }

      return res;
    });

    renderer.refresh();
    random.assign(graph, {rng: rng});
})();
