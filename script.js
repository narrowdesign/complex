// TODO FEATURES

/* 

IF agent has complex

link to complex
display differently
link to elsewhere

spread items out (increase distance)

*/

// appears in X complexes
// group selection into class or list

const agentMenuEl = document.querySelector('.agentMenu');
const agentMenuItemListEls = document.querySelectorAll('.agentMenu__item');
const selectedAgentMenuEl = document.querySelector('.menu');
const selectionBoxEl = document.querySelector('.selectionBox');
const mapEl = document.querySelector('.map')
const complexSelectEl = document.querySelector('.complexSelect');
const newFromSelectedButton = document.querySelector('.button--newFromSelected');
const copySelectedButton = document.querySelector('.button--copySelected');
const newButton = document.querySelector('.button--newComplex');
const deleteButton = document.querySelector('.button--delete');
const backupButton = document.querySelector('.button--backup');
const elsewhereListEl = document.querySelector('.elsewhereList');

window.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('keydown', handleKeyDown)
window.addEventListener('keyup', handleKeyUp)
window.addEventListener('keypress', handleKeyPress)

agentMenuItemListEls.forEach((item) => {
  item.addEventListener('mouseup', handleMouseUpAgentMenuItem);
})

newFromSelectedButton.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  createComplexFromSelected()
});

newButton.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  createComplex()
});

deleteButton.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  deleteComplex();
});

backupButton.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  saveBackup();
});

copySelectedButton.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  copySelected()
});

const mementos = [];
const types = ['all', 'concept','artifact','person','organization','place'];

let canvasState = {
  currentType: 'concept',
  x: 0,
  y: 0,
  centerX: window.innerWidth / 2,
  centerY: window.innerHeight / 2,
  isInitialized: false,
  isMouseDown: false,
  isAgentDragging: false,
  isAgentFocused: false,
  isSelectedAgentMenu: false,
  isGhostDragging: false,
  isCanvasDragging: false,
  isDoubleClick: false,
  isAltKey: false,
  isSelecting: false,
  isolatedType: 0,
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  mouseMoveX: 0,
  mouseMoveY: 0,
  mouseDownX: window.innerWidth / 2,
  mouseDownY: window.innerHeight / 2,
  startAgent: undefined,
  endAgent: undefined,
  activeAgent: undefined,
  selectedList: [],
  ghostSelectedList: [],
  alsoList: [],
  undoLevel: -1
}

let complexState = {
  name: "",
  agentList: [],
  relationshipList: [],
}

function initializeUI() {
  setComplexSelectList();
  complexSelectEl.addEventListener('change', (e) => {
    applyState(JSON.parse(localStorage[e.target.value]))
    initializeCanvas();
  })
  animate();
}

function setComplexSelectList() {
  complexSelectEl.innerHTML = '<option value="none" selected disabled>Open complexes</option>';
  Object.keys(localStorage).sort().forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.text = key;
    complexSelectEl.appendChild(option);
    if (complexState.name !== '' && key === complexState.name) {
      option.selected = true;
    }
  })
}

function hideAgentMenu() {
  document.body.classList.remove('isAgentMenu');
}

function handleMouseUpAgentMenuItem(e) {
  e.stopPropagation();
  canvasState.isMouseDown = false;
  const item = e.currentTarget;
  createAgent(item.dataset.type);
  hideAgentMenu();
}

function handleKeyUp(e) {
  saveState();
  switch (e.key) {
    case 'Alt':
      canvasState.isAltKey = false;
      break;
    case 'Shift':
      canvasState.isShiftKey = false;
      break;
    case 'Control':
      canvasState.isCtrlKey = false;
      break;
    case 'Meta':
      canvasState.isMetaKey = false;
      break;  
    case ' ':
      document.body.classList.remove('isSpaceKey')
      canvasState.isSpaceKey = false;
      break;
    case 'Escape':
      removeEmpty()
      break;
    case 'Backspace':
      if (canvasState.selectedList.length > 1) {
        canvasState.selectedList.forEach((agent) => {
          removeAgent(agent);
        })
        canvasState.selectedList = [];
      }
      break;      
    case 'Enter':
      if (canvasState.isShiftKey) return;
      removeEmpty();
      if (complexState.agentList.length > 0) {
        canvasState.mouseDownX = document.body.getBoundingClientRect().width / 2 + Math.cos(complexState.agentList.length / Math.PI * 2) * 200 - canvasState.x;
        canvasState.mouseDownY = document.body.getBoundingClientRect().height / 2 + Math.sin(complexState.agentList.length / Math.PI * 2) * 200 - canvasState.y;
      }
      clearSelectedList()
      createAgent(canvasState.currentType);
      break;
    case 'ArrowLeft':
      moveSelectedAgents(e);
      break;
    case 'ArrowRight':
      moveSelectedAgents(e);
      break;
    case 'ArrowDown':
      moveSelectedAgents(e);
      break;      
    case 'ArrowUp':
      moveSelectedAgents(e);
      break;
    case '0':
      toggleType(0);
      break;
    case '1':
      toggleType(1);
      break;
    case '2':
      toggleType(2);
      break;
    case '3':
      toggleType(3);
      break;
    case '4':
      toggleType(4);
      break;
    case '5':
      toggleType(5);
      break;
    default:
      break;
  }
}

function handleKeyPress(e) {
  switch (e.key) {  
    case 'Enter':
      if (!e.shiftKey) {
        e.preventDefault();
      }
      break;
    default:
      break;
  }
}

function moveSelectedAgents(e) {
  if (canvasState.selectedList.length > 1 || (canvasState.selectedList[0] !== document.activeElement.parentElement)) {
    let multiplier = e.shiftKey ? 10 : 1;
    multiplier = e.altKey ? 0.25 : multiplier;
    canvasState.selectedList.forEach((agent) => {
      if (e.key === 'ArrowLeft') {
        agent.x -= 1 * multiplier;
      } else if (e.key === 'ArrowRight') {
        agent.x += 1 * multiplier;
      } else if (e.key === 'ArrowUp') {
        agent.y -= 1 * multiplier;
      } else if (e.key === 'ArrowDown') {
        agent.y += 1 * multiplier;
      }
      agent.style.transform = `translate(${agent.x}px, ${agent.y}px)`;
    })
  }
}

function removeEmpty() {
  const agent = document.activeElement.parentElement;
  const agentType = agent.classList.contains('agent') ? 'agent' : 'relationship';

  if (agent.innerText === '') {
    if (agentType === 'agent') {
      const agentIndex = complexState.agentList.indexOf(agent);
      complexState.agentList.splice(agentIndex, 1)
    }
    removeAgent(agent);
  }
}

function removeAgent(agent) {
  const relationshipMatches = getRelationshipMatches(agent)
  for (let i = complexState.agentList.length; i >= 0; i--) {
    if (agent === complexState.agentList[i]) {
      complexState.agentList.splice(i,1);
    }
  }
  if (relationshipMatches.length > 0) {
    for (let i = relationshipMatches.length; i > 0; i--) {
      if (relationshipMatches[i - 1] !== undefined) {
        complexState.relationshipList[relationshipMatches[i - 1]][3].remove();
        complexState.relationshipList[relationshipMatches[i - 1]][0][0].remove();
        complexState.relationshipList[relationshipMatches[i - 1]][0][1].remove();
        complexState.relationshipList.splice(i - 1,1);
      }
    }
  }
  alsoList = [];
  agent.remove();
  saveState();
}

function getSelectedRelationships() {
  return complexState.relationshipList.filter((rel, i) => {
    const relMatches = canvasState.selectedList.filter((agent) => {
      if (rel.includes(agent)) {
        return rel;
      }
    })
    if (relMatches.length > 0) {
      return relMatches;
    }
  })
}

function getRelationshipMatches(agent) {
  return complexState.relationshipList.map((rel, i) => {
    if (rel.includes(agent)) {
      return i;
    }
  })
}

function handleKeyDown(e) {
  switch (e.key) {
    case 'Alt':
      canvasState.isAltKey = true;
      break;
    case 'Shift':
      canvasState.isShiftKey = true;
      break;
    case 'Control':
      canvasState.isCtrlKey = true;
      break;
    case 'Meta':
      canvasState.isMetaKey = true;
      break;  
    case ' ':
      document.body.classList.add('isSpaceKey')
      canvasState.isSpaceKey = true;
      break;
    case 'z':
      if (e.metaKey) {
        const undo = confirm('You sure? This might delete stuff permanently.');
        if (!undo) return;

        if (e.shiftKey) {
          canvasState.undoLevel--;
        } else {
          canvasState.undoLevel++;
        }
        const index = Math.min(mementos.length - 1, Math.max(0, mementos.length - 1 - canvasState.undoLevel));
        applyState(mementos[index]);
      }
      break;
    case 'v':
      if (e.metaKey) {
        pasteSelected();
      }
      break;
    default:
      break;
  }
}

function handleClickAgent(e) {
  e.stopPropagation();
}

function handleMouseDownAgent(e) {
  const agent = e.currentTarget;
  canvasState.startAgent = agent;
  canvasState.activeAgent = agent;
  if ((e.shiftKey || e.metaKey) && canvasState.selectedList.indexOf(agent) !== -1) {
    deselectAgent(agent)
  } else {
    selectAgent(e, agent);
  }
  e.stopPropagation();

  // if (e.altKey) {
  //   canvasState.ghostSelectedList = canvasState.selectedList.map((agent, i) => {
  //     createAgent(agent.type, agent.label, agent.x, agent.y, agent.scale, null);
  //     const clone = canvasState.selectedList[canvasState.selectedList.length - 1];
  //     clone.style.opacity = 0.5;
  //     clone.style.pointerEvents = "none";
  //     return clone;
  //   })
  // }

  if (e.altKey || e.shiftKey || e.metaKey || canvasState.selectedList > 1) {
    e.preventDefault();
  }
}

function handleMouseEnterAgent(e) {

}

function handleMouseUpAgent(e) {
  const agent = e.currentTarget;
  canvasState.endAgent = agent;
  canvasState.ghostSelectedList.forEach((agent) => {
    agent.remove();
  });
  
  if (canvasState.endAgent !== canvasState.startAgent && e.altKey){
    connectAgents();
    e.stopPropagation();
  } else {
    setTimeout(() => {
      document.activeElement.blur();
      canvasState.isAgentFocused = false;
    },20)
    e.stopPropagation();
  }
  setDefaultCanvasState();
  saveState();
}

function handleDblClickAgent(e) {
  const agent = e.currentTarget;
  setTimeout(() => {
    canvasState.isAgentFocused = true;
    agent.querySelector('.agent__label').focus();
  },25)
}

function handleMouseDown(e) {
  canvasState.isMouseDown = true;
  canvasState.mouseDownX = e.clientX - canvasState.x;
  canvasState.mouseDownY = e.clientY - canvasState.y;

  if (!e.metaKey && !e.shiftKey && !canvasState.isSpaceKey) {
    clearSelectedList();
  }

  setTimeout(() => {
    if (canvasState.isMouseDown && !canvasState.isCanvasDragging && !canvasState.isSelecting && !canvasState.isAgentDragging && !canvasState.isGhostDragging) {
      showAgentMenu(e);
    }
  }, 200)
}

function handleMouseMove(e) {
  canvasState.mouseMoveX = e.clientX - canvasState.mouseX;
  canvasState.mouseMoveY = e.clientY - canvasState.mouseY;
  
  if (canvasState.activeAgent && !e.altKey) {
    dragSelected();
  } else if (canvasState.activeAgent && e.altKey) {
    dragGhosted();
  }

  if (canvasState.isMouseDown && canvasState.isSpaceKey) {
    dragCanvas();
  } 

  if (canvasState.isMouseDown && !e.altKey && !e.metaKey && !e.shiftKey && !canvasState.isSpaceKey) {
    if (!canvasState.isSelecting) {
      clearSelectedList();
      canvasState.isSelecting = true;
      document.body.classList.add('isSelecting');
      selectionBoxEl.style.left = `${canvasState.mouseX - canvasState.x}px`;
      selectionBoxEl.style.top = `${canvasState.mouseY - canvasState.y}px`;
    }
    dragSelectionBox();
  }

  applyLens(document.querySelectorAll('.agent__label'));
  applyLens(document.querySelectorAll('.relationship__label'));
  canvasState.mouseX = e.clientX;
  canvasState.mouseY = e.clientY;
}

function handleMouseUp() {
  canvasState.ghostSelectedList = [];
  setDefaultCanvasState()
}

function selectAgent(e, agent) {
  const matchIndex = canvasState.selectedList.indexOf(agent);
  if (matchIndex === -1) {
    if (!e.metaKey && !e.shiftKey && !canvasState.isSelecting) {
      clearSelectedList();
    }
    canvasState.selectedList.push(agent);
  }

  const relationships = getSelectedRelationships()
  
  relationships.forEach((rel, i) => {
    rel[1].classList.add('isHighlighted');
    rel[2].classList.add('isHighlighted');
    rel[0][1].setAttribute(`stroke-width`, '3');
    rel[0][1].style.opacity = 1;
  })

  canvasState.selectedList.forEach((item) => {
    if (canvasState.selectedList.length > 1) {
      document.activeElement.blur();
      canvasState.isAgentFocused = false;
    }
    item.classList.add('isSelected');
    item.isSelected = true;
  })
  canvasState.isAgentDragging = false;
  clearAlsoList();
  Object.keys(localStorage).forEach((key) => {
    if (key !== '' && key === complexState.name) return;
    let matched = false;
    const nameParts = agent.label.split(' ')
    const lastName = agent.type === "person" ? nameParts[nameParts.length - 1].toLowerCase() : false;
    JSON.parse(localStorage[key]).agentList.forEach((otherAgent) => {
      const rawLabel = agent.label.toLowerCase().replace(/[^0-9a-z]/gi, '');
      const otherRawLabel = otherAgent.label.toLowerCase().replace(/[^0-9a-z]/gi, '');
      if (rawLabel.length > 1 && !matched && (otherRawLabel.indexOf(rawLabel) !== -1 || otherRawLabel === lastName)) {
        canvasState.alsoList.push(key);
        matched = true;
      }
    })  
  })
  showSelectedAgentMenu(e);
}

function clearAlsoList() {
  canvasState.alsoList = [];
  document.querySelectorAll('.otherComplex').forEach((other) => {
    other.remove();
  })
}

function deselectAgent(agent) {
  const matchIndex = canvasState.selectedList.indexOf(agent);
  if (matchIndex !== -1) {
    agent.isSelected = false;
    agent.classList.remove('isSelected');
    canvasState.isAgentFocused = false;
    
    const relationships = getSelectedRelationships()
    
    relationships.forEach((rel, i) => {
      rel[1].classList.remove('isHighlighted');
      rel[2].classList.remove('isHighlighted');
      rel[0][1].setAttribute(`stroke-width`, '1');
      rel[0][1].style.opacity = 0.5;
    })

    canvasState.selectedList.splice(matchIndex, 1);
  }
  if (canvasState.selectedList.length === 0) {
    hideSelectedAgentMenu();
  }
}

function setDefaultCanvasState() {
  canvasState.isCanvasDragging = false;
  setTimeout(() => {
    canvasState.isAgentDragging = false;
    canvasState.isGhostDragging = false;
  }, 100)
  canvasState.isMouseDown = false;
  canvasState.isSelecting = false;
  document.body.classList.remove('isSelecting');
  canvasState.startAgent = null;
  canvasState.endAgent = null;
  canvasState.activeAgent = null;
  hideAgentMenu();
}

function dragCanvas() {
  canvasState.isCanvasDragging = true;
  updateCanvasPosition()
}

function updateCanvasPosition() {
  canvasState.x += canvasState.mouseMoveX;
  canvasState.y += canvasState.mouseMoveY;
  canvasState.centerX -= canvasState.mouseMoveX;
  canvasState.centerY -= canvasState.mouseMoveY;
  mapEl.style.transform = `translate(${canvasState.x}px, ${canvasState.y}px)`;
}

function dragGhosted() {
  canvasState.isGhostDragging = true;
  canvasState.ghostSelectedList.forEach((agent) => {
    const agentX = Number(agent.x || 0) + Number(canvasState.mouseMoveX) * 1;
    const agentY = Number(agent.y || 0) + Number(canvasState.mouseMoveY) * 1;
    agent.x = agentX;
    agent.y = agentY;
    agent.style.transform = `translate(${agentX}px, ${agentY}px)`;
  })
}

function dragSelected() {
  canvasState.isAgentDragging = true;
  canvasState.selectedList.forEach((agent) => {
    const agentX = Number(agent.x || 0) + Number(canvasState.mouseMoveX) * 1;
    const agentY = Number(agent.y || 0) + Number(canvasState.mouseMoveY) * 1;
    agent.x = agentX;
    agent.y = agentY;
    agent.style.transform = `translate(${agentX}px, ${agentY}px)`;
  })

  const relationships = getSelectedRelationships();
  
  relationships.forEach((rel, i) => {
    const startX = rel[1].getBoundingClientRect().left - canvasState.x;
    const startY = rel[1].getBoundingClientRect().top - canvasState.y;
    
    const endX = rel[2].getBoundingClientRect().left - canvasState.x;
    const endY = rel[2].getBoundingClientRect().top - canvasState.y;
    const distX = endX - startX
    const distY = endY - startY
    const dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY,2));
    rel[0][0].setAttribute(`x2`, dist);
    rel[0][1].setAttribute(`x2`, dist);
    const relX = startX + (endX - startX) / 2;
    const relY = startY + (endY - startY) / 2;
    let angle = Math.atan2(endY - startY, endX - startX);
    rel[0][0].parentNode.style.transform = `translate(${startX}px, ${startY}px) rotate(${angle}rad)`;
    rel[0][0].parentNode.setAttribute('width', dist);
    rel[3].style.transform = `translate(${relX}px, ${relY}px) rotate(${angle}rad)`;
  })
}

function dragSelectionBox() {
  let transform = '';
  const width = canvasState.mouseX - canvasState.mouseDownX - canvasState.x;
  const height = canvasState.mouseY - canvasState.mouseDownY - canvasState.y;
  if (width < 0) {
    transform = 'scaleX(-1)';
  }
  if (height < 0) {
    transform += 'scaleY(-1)';
  }
  selectionBoxEl.style.width = `${Math.abs(width)}px`;
  selectionBoxEl.style.height = `${Math.abs(height)}px`;
  selectionBoxEl.style.transform = transform;

  const selectionRect = selectionBoxEl.getBoundingClientRect();
  
  complexState.agentList.forEach((agent) => {
    const agentRect = agent.querySelector('.agent__label').getBoundingClientRect()
    if (selectionRect.right > agentRect.left && selectionRect.left < agentRect.right && selectionRect.bottom > agentRect.top && selectionRect.top < agentRect.bottom) {
      if (!agent.isSelected) {
        selectAgent('', agent);
      }
    } else {
      if (agent.isSelected) {
        deselectAgent(agent);
      }
    }
  })
}

function applyLens(agentList) {
  // agentList.forEach((agent) => {
  //   const x = agent.parentNode.getBoundingClientRect().left - canvasState.x;
  //   const y = agent.parentNode.getBoundingClientRect().top - canvasState.y;
  //   const distX = x - canvasState.mouseX + canvasState.x;
  //   const distY = y - canvasState.mouseY + canvasState.y;
  //   const dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
  //   const scale = Math.max(0.3, 1 - dist * 0.001);
  //   const blur = Math.min(10, dist * 0.004);
  //   // agent.style.filter = `blur(${blur}px)`;
  //   agent.style.transform = `scale(${scale})`;
  // })
  // complexState.relationshipList.forEach((rel) => {
  //   const agent = rel[0][0];
  //   const x = agent.parentNode.getBoundingClientRect().left - canvasState.x;
  //   const y = agent.parentNode.getBoundingClientRect().top - canvasState.y;
  //   const distX = x - canvasState.centerX;
  //   const distY = y - canvasState.centerY;
  //   const dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
  //   const blur = Math.min(10, dist * 0.004);
  //   // agent.style.filter = `blur(${blur}px)`;
  // })
}

function clearSelectedList() {

  canvasState.selectedList.forEach((item) => {
    item.classList.remove('isSelected');
    canvasState.isAgentFocused = false;
    item.isSelected = false;
  });

  const matches = getSelectedRelationships()
  
  matches.forEach((rel, i) => {
    rel[1].classList.remove('isHighlighted');
    rel[2].classList.remove('isHighlighted');
    rel[0][1].setAttribute(`stroke-width`, '1');
    rel[0][1].style.opacity = 0.5;
  })
  canvasState.selectedList = [];
  document.querySelectorAll('.otherComplex').forEach((other) => {
    other.remove();
  })
  clearAlsoList();
  document.body.classList.remove('isSelectedAgentMenu');
}

function handleMouseEnterAgent(e) {
  
}

function toggleType(num) {
  // if ()
  const type = types[num];
  if (num === 0 || canvasState.isolatedType === num) {
    document.body.classList.remove('isIsolated');
    document.querySelectorAll(`.agent--isIsolated`).forEach((agent) => {
      agent.classList.remove('agent--isIsolated');
    })
    canvasState.isolatedType = 0;

  } else if (num !== 0) {
    document.body.classList.add('isIsolated');
    document.querySelectorAll(`.agent--${type}`).forEach((agent) => {
      agent.classList.add('agent--isIsolated');
    })
    canvasState.isolatedType = num;
  }
}

function showAgentMenu(e) {
  const x = e.clientX;
  const y = e.clientY;
  canvasState.isMouseDown = false;
  agentMenuEl.style.transform = `translate(${x}px, ${y}px)`;
  document.body.classList.add('isAgentMenu');
}

function showSelectedAgentMenu(e) {
  canvasState.isSelectedAgentMenu = true;
  document.body.classList.add('isSelectedAgentMenu');
  canvasState.alsoList.forEach((complex) => {
    const agentEl = document.createElement('div');
    agentEl.innerHTML = complex;
    agentEl.classList.add('otherComplex');
    elsewhereListEl.appendChild(agentEl);
    agentEl.addEventListener('mousedown', (e) => {
      applyState(JSON.parse(localStorage[e.target.innerText]));
      complexSelectEl.value = e.target.innerText;
    })
  })
}

function hideSelectedAgentMenu() {
  canvasState.isSelectedAgentMenu = false;
  document.body.classList.remove('isSelectedAgentMenu');
}

function createAgent(type = canvasState.currentType, text = '', x = canvasState.mouseDownX, y = canvasState.mouseDownY, scale = 1, blur = 0, uuid, index) {
  let label = text;

  if (complexState.agentList.length === 0 && index === undefined) {
    if (!complexState.name) {
      complexState.name = prompt('Name this complex');
      label = complexState.name;
    }
  }

  initializeCanvas();

  canvasState.currentType = type || canvasState.currentType;
  const agentEl = document.createElement('div');
  agentEl.classList.add('agent');
  agentEl.classList.add(`agent--${type}`);
  const agentLabelEl = document.createElement('div');
  agentLabelEl.classList.add('agent__label');
  const distX = x - canvasState.centerX;
  const distY = y - canvasState.centerY;
  const dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
  agentEl.uuid = uuid || self.crypto.randomUUID();
  
  agentEl.style.transform = `translate(${x}px, ${y}px)`;
  agentEl.scale = Math.max(0.6, scale);
  agentEl.blur = blur;
  agentEl.x = x;
  agentEl.y = y;
  agentEl.type = canvasState.currentType;
  let rotation = getRotation(agentEl.type);
  setTimeout(() => {
    agentLabelEl.style.transform = `scale(${scale}) ${rotation}`;
    agentLabelEl.style.opacity = `1`;
    agentLabelEl.style.transition = 'opacity 500ms, transform 400ms';
    agentLabelEl.style.filter = `blur(${blur}px)`;
  }, 10 * index);
  agentLabelEl.style.animationDelay = `${Math.random() * 10}s`;
  agentEl.label = label;
  agentLabelEl.contentEditable = true;
  agentLabelEl.innerText = label;
  agentEl.addEventListener('click', handleClickAgent);
  agentEl.addEventListener('mousedown', handleMouseDownAgent);
  agentEl.addEventListener('mouseenter', handleMouseEnterAgent);
  agentEl.addEventListener('mouseup', handleMouseUpAgent);
  agentEl.addEventListener('dblclick', handleDblClickAgent);
  agentEl.onwheel = function (e) {
    e.preventDefault();
  
    if (e.ctrlKey) {
      const scaleDelta = e.deltaY * 0.01;
      agentLabelEl.style.transitionProperty = "opacity";
      scaleAgent(scaleDelta, agentEl, agentLabelEl);
    } else {
      const blurDelta = e.deltaY * 0.01;
      blurAgent(blurDelta, agentEl, agentLabelEl);
    }
    clearTimeout(canvasState.wheelTimeout);
    canvasState.wheelTimeout = setTimeout(() => {
      saveState()
    }, 1000)
  };
  
  agentEl.appendChild(agentLabelEl);
  mapEl.appendChild(agentEl);
  if (index !== undefined) {
    complexState.agentList.splice(index, 1, agentEl);
  } else {
    complexState.agentList.push(agentEl);
    saveState();
    agentLabelEl.focus();
  }
  return agentEl;
}

function getRotation(type) {
  let rotation = '';
  if (type === types[1]) {
    rotation = `rotateX(54.75deg) rotateY(0deg) rotateZ(-315deg)`;
  } else if (type === types[2]) {
    rotation = `rotateX(54.75deg) rotateY(0deg) rotateZ(-315deg)`;
  } else if (type === types[3]) {
    rotation = `rotateY(-35.75deg) rotateZ(25deg) rotateX(330deg)`;
  } else if (type === types[4]) {
    rotation = `rotateY(35.75deg) rotateZ(-25deg) rotateX(330deg)`;
  } else if (type === types[5]) {
    rotation = `rotateX(54.75deg) rotateY(0deg) rotateZ(315deg)`;
  }
  return rotation;
}

function scaleAgent(delta, agent, label) {
  agent.scale -= delta;
  agent.scale = Math.max(0.6, agent.scale);
  const rotation = getRotation(agent.type);
  label.style.transform = `scale(${Math.round(agent.scale * 5) / 5}) ${rotation}`;
}

function blurAgent(delta, agent, label) {
  agent.blur -= delta;
  agent.blur = Math.max(0, agent.blur);
  label.style.filter = `blur(${agent.blur}px)`;
}

function connectAgents(index, text = '>') {
  const connectionEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const defsEl = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const gradientEl = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  const stop1El = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  const stop2El = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  const relationshipEl = document.createElement('div');
  const relationshipLabelEl = document.createElement('div');
  connectionEl.classList.add('connection');
  const startX = canvasState.startAgent.getBoundingClientRect().left - canvasState.x;
  const startY = canvasState.startAgent.getBoundingClientRect().top - canvasState.y;
  const endX = canvasState.endAgent.getBoundingClientRect().left - canvasState.x;
  const endY = canvasState.endAgent.getBoundingClientRect().top - canvasState.y;
  const distX = endX - startX
  const distY = endY - startY
  const dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY,2));
  connectionEl.setAttribute('width', dist);
  connectionEl.setAttribute('height', 1);
  const angle = Math.atan2(distY, distX);
  const scale = 1; //Math.max(0, 1 - dist * 0.001);
  const id = performance.now();
  const lineEl = new Line(0, 0, dist, 0, id);
  const relX = startX + distX / 2;
  const relY = startY + distY / 2;
  connectionEl.style.transformOrigin = `0 0`;
  connectionEl.style.transform = `translate(${startX}px, ${startY}px) rotate(${angle}rad)`;
  relationshipEl.classList.add('relationship');
  relationshipLabelEl.classList.add('relationship__label');
  relationshipLabelEl.innerText = text;
  relationshipLabelEl.contentEditable = true;
  relationshipEl.style.transform = `translate(${relX}px, ${relY}px) rotate(${angle}rad) scale(${scale})`;
  
  relationshipEl.appendChild(relationshipLabelEl);
  connectionEl.appendChild(lineEl[0]);
  connectionEl.appendChild(lineEl[1]);
  defsEl.appendChild(gradientEl);
  gradientEl.appendChild(stop1El);
  gradientEl.appendChild(stop2El);
  connectionEl.appendChild(defsEl);
  mapEl.appendChild(relationshipEl);
  mapEl.appendChild(connectionEl);
  const startBg = window.getComputedStyle(canvasState.startAgent.querySelector('.agent__label')).getPropertyValue('--bgColor');
  const endBg = window.getComputedStyle(canvasState.endAgent.querySelector('.agent__label')).getPropertyValue('--bgColor');
  relationshipLabelEl.style.borderColor = startBg;
  relationshipLabelEl.style.color = startBg;
  stop1El.setAttribute('stop-color', startBg);
  stop2El.setAttribute('stop-color', endBg);
  gradientEl.setAttribute('id', `lineGradient${id}`);
  gradientEl.setAttribute('x1', '0%');
  gradientEl.setAttribute('x2', '100%');
  gradientEl.setAttribute('y1', '0%');
  gradientEl.setAttribute('y2', '0%');
  stop1El.setAttribute('offset', '0%')
  stop2El.setAttribute('offset', '100%')
  
  const rel = [lineEl, canvasState.startAgent, canvasState.endAgent, relationshipEl, text];
  if (index !== undefined) {
    complexState.relationshipList.splice(index, 1, rel);
  } else {
    complexState.relationshipList.push(rel);
    relationshipLabelEl.focus();
    const range = document.createRange();
    range.selectNodeContents(relationshipLabelEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    saveState();
  }
}

const Line = function (startX, startY, endX, endY, id) {
  const lineEl = document.createElementNS("http://www.w3.org/2000/svg", 'line');
  lineEl.setAttribute('x1', startX);
  lineEl.setAttribute('y1', startY - 1);
  lineEl.setAttribute('x2', endX);
  lineEl.setAttribute('y2', endY + 1);
  lineEl.setAttribute('stroke', `black`);
  lineEl.setAttribute('stroke-width', '6');
  lineEl.setAttribute('stroke-linecap', 'rounded');

  const line2El = document.createElementNS("http://www.w3.org/2000/svg", 'line');
  line2El.setAttribute('x1', startX);
  line2El.setAttribute('y1', startY - 1);
  line2El.setAttribute('x2', endX);
  line2El.setAttribute('y2', endY + 1);
  line2El.setAttribute('stroke', `url(#lineGradient${id})`);
  line2El.setAttribute('stroke-width', '1');
  line2El.setAttribute('stroke-linecap', 'rounded');
  return [lineEl, line2El];
}

function createComplexFromSelected() {
  const newList = [...canvasState.selectedList];
  createComplex();
  newList.forEach((agent, i) => {
    createAgent(agent.type, agent.label, agent.x, agent.y, agent.scale, agent.blur, null, i);
  });
  setTimeout(() => {
    saveState();
  }, 1000)
}

function createComplex() {
  complexState.relationshipList = [];
  complexState.name = '';
  complexState.name = prompt('Name this complex') || '';
  if (complexState.name === '') return;
  clearCanvas();
  saveState();
  setComplexSelectList();
  initializeCanvas();
}

function initializeCanvas() {
  canvasState.isInitialized = true;
  document.body.classList.add('isInitialized')
  document.body.classList.add('isActiveComplex');

  if (complexState.agentList.length !== 0) return;
  document.body.classList.add('isAgentMenu');
  agentMenuEl.style.transform = `translate(${canvasState.centerX}px, ${canvasState.centerY}px)`;
}

function deleteComplex() {
  const confirmed = prompt(`Type “${complexState.name}” to permanently delete this complex and its contents`) === complexState.name;
  if (!confirmed) return;
  complexState.agentList.forEach((agent, i) => {
    agent.style.transform = `translate(${agent.x}px, ${agent.y}px) scale(0.2)`;
    agent.style.opacity = `0`;
    agent.style.transition = `transform 200ms, opacity 200ms`;
    agent.style.transitionDelay = `${i * 20}ms`;
  })
  setTimeout(() => {
    clearCanvas();
  }, 2000)
  localStorage.removeItem(complexState.name);
  setComplexSelectList()
  document.body.classList.remove('isActiveComplex');
}

function copySelected() {
  canvasState.copiedAgents = canvasState.selectedList;
}

function pasteSelected() {
  canvasState.copiedAgents.forEach((agent, i) => {
    const newAgent = createAgent(agent.type, agent.label, agent.x, agent.y, agent.scale, agent.blur, null, undefined);
    // selectAgent(newAgent);
  })
}

function saveState() {
  complexState.agentList.forEach((agent, i) => {
    agent.label = agent.innerText;
  });
  complexState.relationshipList.forEach((rel, i) => {
    rel[4] = rel[3].innerText;
  });
  
  const state = JSON.parse(JSON.stringify(complexState));
  mementos.push(state);
  localStorage.setItem(complexState.name, JSON.stringify(complexState));
}

function saveBackup() {
  let textFile = null;
  const makeTextFile = function (text) {
    const data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
  };

  const link = document.createElement('a');
  const date = new Date();
  link.setAttribute('download', `${date.getFullYear()}-${(String(date.getMonth() + 1).padStart(2, "0"))}-${String(date.getDate()).padStart(2, "0")}.local`);
  link.href = makeTextFile(JSON.stringify(localStorage));
  document.body.appendChild(link);

  // wait for the link to be added to the document
  window.requestAnimationFrame(function () {
    const event = new MouseEvent('click');
    link.dispatchEvent(event);
    document.body.removeChild(link);
  });
}

function applyState(state) {
  clearCanvas();
  complexState = JSON.parse(JSON.stringify(state));
  complexState.agentList.forEach((agent, i) => {
    createAgent(agent.type, agent.label, agent.x, agent.y, agent.scale, agent.blur, agent.uuid, i);
  })
  
  complexState.relationshipList.forEach((rel, i) => {
    complexState.agentList.forEach((agent) => {
      if (agent.uuid === rel[1].uuid) {
        canvasState.startAgent = agent;
      }
      if (agent.uuid === rel[2].uuid) {
        canvasState.endAgent = agent;
      }
    });
    connectAgents(i, rel[4]);
  })

  updateCanvasPosition();
}

function resetCanvasState() {
  canvasState.x = 0;
  canvasState.y = 0;
  canvasState.centerX = window.innerWidth / 2;
  canvasState.centerY = window.innerHeight / 2;
  canvasState.mouseX = window.innerWidth / 2;
  canvasState.mouseY = window.innerHeight / 2;
  canvasState.mouseDownX = window.innerWidth / 2;
  canvasState.mouseDownY = window.innerHeight / 2;
  canvasState.mouseMoveX = 0;
  canvasState.mouseMoveY = 0;
  canvasState.startAgent = null;
  canvasState.endAgent = null;
  canvasState.isAgentDragging = false;
  canvasState.isGhostDragging = false;
  canvasState.selectedList = [];
}

function clearCanvas() {
  resetCanvasState();
  mapEl.style.transform = `translate(0,0)`;
  complexState.agentList.forEach((agent) => {
    agent.remove();
  })
  complexState.agentList = [];
  complexState.relationshipList.forEach((rel) => {
    rel.forEach((el, i) => {
      if (i === 0) {
        el[0].remove();
        el[1].remove();
      } else if (i < 4) {
        el.remove()
      }
    })
  })
}

function chaos() {

}

function animate() {
  
}

initializeUI();
