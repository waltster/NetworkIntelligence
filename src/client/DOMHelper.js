/**
 *
 * Copyright 2022, University of South Carolina. All rights reserved.
 * Released under the license found in LICENSE.md.
 *
 * @date 9 August 2022
 * @author Walter Pach <walterdpach@gmail.com>
 */
import seedrandom from 'seedrandom';
import random from 'graphology-layout/random.js';

export const heatmap = ['#BD7AF6', '#7D3CB5', '#681E7E', '#06A9FC', '#0079E7', '#0052A5', '#16DD36', '#009E47', '#00753A', '#FFF735', '#FFCB35', '#FFA135', '#FF7435', '#D82735'];
const container = document.getElementById('container');
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('suggestions');
const heatmap_display = document.getElementById('heatmap_display');
const layoutToggleButton = document.getElementById('layout_toggle');
const layoutSelectionDropdown = document.getElementById('layout_selection');
const seedInput = document.getElementById('seed');
const topIps = document.getElementById('top_ips');
const nodeInfo = document.getElementById('nodeinfo');
const information = document.getElementById('information');

export function init(graph, renderer, state, layouts, rng, setSearchQuery, setHoveredNode, packetsPerIP){
  heatmap_display.innerHTML = 'Few ';
  for(const color of heatmap){
      heatmap_display.innerHTML += `<svg width="15" height="15"><rect width="20" height="20" style="fill:${color};" /></svg>`;
  }
  heatmap_display.innerHTML += ' Many';

  layoutSelectionDropdown.onchange = function(){
        if(state.currentLayout != 'seededrandom') state.currentLayout.stop();

        if(layoutSelectionDropdown.value != 'seededrandom'){
            seedInput.style.display = 'none';
        }else{
            seedInput.style.display = 'inline';
        }

        layoutToggleButton.innerHTML = 'Start Layout';
        state.currentLayout = layouts[layoutSelectionDropdown.value];
  };

  var toggleFA2Layout = function(){
      if(state.currentLayout == 'seededrandom'){
        var seed = seedInput.value;
        rng = seedrandom(seed);
        random.assign(graph, {rng: rng});
        return;
      }

      if(state.currentLayout.isRunning()){
        state.currentLayout.stop();
        layoutToggleButton.innerHTML = 'Start Layout';
      }else{
        state.currentLayout.start();
        layoutToggleButton.innerHTML = 'Stop Layout';
      }
  };

  layoutToggleButton.addEventListener('click', toggleFA2Layout);

  searchInput.addEventListener('input', function(){
    setSearchQuery(graph, renderer, state, searchInput.value || "", searchInput);
  });

  searchInput.addEventListener('blur', function(){
    setSearchQuery(graph, renderer, state, "", searchInput);
  });

  renderer.on('doubleClickNode', function(e){
      e.preventSigmaDefault();
      console.log(e);
      nodeInfo.style.display = "block";
      nodeInfo.innerHTML = `
        <h3>${e.node} Insights</h3>
        <p>${packetsPerIP[e.node]} packets exchanged</p>
        <a target='_blank' class='no-decoration' href='https://viz.greynoise.io/ip/${e.node}'>GreyNoise Report</a>
        <br /><br />
        <a target='_blank' class='no-decoration' href='https://security.microsoft.com/ips/${e.node}'>Defender IP Page</a>
        <br /><br />
        <a target='_blank' class='no-decoration' href='https://www.shodan.io/host/${e.node}'>Shodan Report</a>
      `;
  });

  renderer.on('clickStage', function(){
      if(nodeInfo.style.display != 'none'){
        nodeInfo.style.display = 'none';
      }

      state.nodeClicked = false;
      setHoveredNode(state, graph, renderer, undefined);
  });

  document.addEventListener('mousedown', function(event) {
      if (event.detail > 1) {
        event.preventDefault();
      }
    }, false);
};

export function postInit(graph, renderer, state, sortedNodes, sortIPAddresses){
  searchSuggestions.innerHTML = graph.nodes().sort(sortIPAddresses).map(function(node){
    return `<option value="${graph.getNodeAttribute(node, "label")}"></option>`
  });

  for(var i = 0; i < 10; i++){
    top_ips.innerHTML += `<li><a target='_blank' class='no-decoration' href='https://viz.greynoise.io/ip/${sortedNodes[i]}'>${sortedNodes[i]}</a></li>`;
  }

  information.innerHTML += `<p class='center'>${graph.order} nodes total</p>`;
}
