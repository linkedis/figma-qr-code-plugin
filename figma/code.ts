/// <reference types="@figma/plugin-typings" />

import { e } from "ofetch/dist/shared/ofetch.441891d5";


function isURL(text) {
  // URL'leri tanımlayan bir düzenli ifade
  var urlPattern = /^(https?:\/\/\S+|www\.\S+)$/;

  // Metni kontrol et
  if (text.match(urlPattern)) {
    return true;
  } else {
    return false;
  }
}

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 240, height: 450 });
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.on('run', () => {
  //First Run
  figma.currentPage.selection.forEach(async (node) => {
    if (node.type === 'TEXT') {
      // Texti burada alıyoruz.
      figma.ui.postMessage({ type: 'selected', selected: node.characters });
    }
  });
  
});

//eventlistener figma.currentPage.selectionchange
figma.on('selectionchange', () => {
  figma.ui.postMessage({ type: 'selectionchange', selection: figma.currentPage.selection });
  figma.currentPage.selection.forEach(async (node) => {
    if (node.type === 'TEXT') {
      // Texti burada alıyoruz.
      figma.ui.postMessage({ type: 'selected', selected: node.characters });
    }
  });
});

figma.ui.onmessage = async (msg) => {


  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-qr') {
    // get TextNode text
    figma.currentPage.selection.forEach(async (node) => {
      if (node.type === 'TEXT') {
        // Texti burada alıyoruz.
        figma.notify('QR oluşturuluyor...');
        const text = node.characters;
        figma.ui.postMessage({ type: 'text', text: text, data: text });
      }
    });
  } else if (msg.type === 'add-svg') {
    // SVGyi ekliyoruz. ismini de yazıyoruz.
    const svgNode = figma.createNodeFromSvg(msg.svg);
    svgNode.name = msg.name;
    console.log(svgNode);
    svgNode.x = 0;
    svgNode.y = 0;
    figma.currentPage.appendChild(svgNode);
    figma.notify('SVG eklendi...');
  }
  else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
  else if (msg.type === 'notify') {
    figma.notify(msg.message);
  }


  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};
