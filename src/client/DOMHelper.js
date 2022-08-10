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
import * as REDOM from 'redom';

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
  REDOM.mount(heatmap_display, REDOM.text('Few '));

  for(const color of heatmap){
      var square = REDOM.svg('svg',
                      REDOM.svg('rect', {width: 15, height: 15, style: `fill:${color}`}),
                      {width: 15, height: 15}
                   );

      REDOM.mount(heatmap_display, square);
  }

  REDOM.mount(heatmap_display, REDOM.text('Many'));

  layoutSelectionDropdown.onchange = function(){
        if(state.currentLayout != 'seededrandom') state.currentLayout.stop();

        if(layoutSelectionDropdown.value != 'seededrandom'){
            seedInput.style.display = 'none';
        }else{
            seedInput.style.display = 'inline';
        }

        REDOM.setChildren(layoutToggleButton, REDOM.text('Start Layout'));
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
        REDOM.setChildren(layoutToggleButton, REDOM.text('Start Layout'));
      }else{
        state.currentLayout.start();
        REDOM.setChildren(layoutToggleButton, REDOM.text('Stop Layout'));
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
      nodeInfo.style.display = "block";

      REDOM.setChildren(
        nodeInfo,
        REDOM.el('h3', `${e.node} Insights`),
        REDOM.el('p', `${packetsPerIP[e.node]} packets exchanged.`),
        REDOM.el('a.no-decoration.link_padding', 'Greynoise Report', {target: '_blank', href: `https://viz.greynoise.io/ip/${e.node}`}),
        REDOM.el('a.no-decoration.link_padding', 'Defender IP Page', {target: '_blank', href: `https://security.microsoft.com/ips/${e.node}`}),
        REDOM.el('a.no-decoration.link_padding', 'Shodan Report', {target: '_blank', href: `https://www.shodan.io/host/${e.node}`}),
      );
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

window.gotoNode = function(node){
  const nodePosition = window.renderer.getNodeDisplayData(node);

  window.renderer.getCamera().animate(nodePosition, {duration: 500});
  window.state.selectedNode = node;
  window.renderer.refresh();
}

export function postInit(graph, renderer, state, sortedNodes, sortIPAddresses){
  searchSuggestions.innerHTML = graph.nodes().sort(sortIPAddresses).map(function(node){
    return `<option value="${graph.getNodeAttribute(node, "label")}"></option>`
  });

  for(var i = 0; i < (sortedNodes.length < 10 ? sortedNodes.length : 10); i++){
    var link = REDOM.el('a.no-decoration', `${sortedNodes[i]}`, {id: `goto-${sortedNodes[i]}`, href: `javascript:gotoNode('${sortedNodes[i]}');`});

    REDOM.mount(top_ips,
        REDOM.el('li',
            link, {id: `li-${sortedNodes[i]}`}
        )
    );
  }

  REDOM.mount(information,
    REDOM.el('p.center',
      REDOM.text(`${graph.order} nodes total.`)
    )
  );
}
