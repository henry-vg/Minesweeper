document.oncontextmenu = new Function("return false;");

const numCellsX = 9,
  numCellsY = 9,
  numBombs = 10,
  cellSize = 50,
  bombChar = '•',
  flagChar = '⚐';

let cells = [],
  offX,
  offY,
  started = false,
  cellsRevealed = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  offX = (width - (numCellsX * cellSize)) / 2;
  offY = (height - (numCellsY * cellSize)) / 2;

  for (let i = 0; i < numCellsX; i++) {
    cells.push([]);
    for (let j = 0; j < numCellsY; j++) {
      cells[i].push(new cellObject(i, j));
    }
  }

  background(255);

  grid();
}

function grid() {
  noFill();
  stroke(0);
  strokeWeight(2);
  for (let i = 1; i < numCellsY; i++) //horizontal
  {
    line(offX, offY + i * cellSize, offX + numCellsX * cellSize, offY + i * cellSize);
  }

  for (let i = 1; i < numCellsX; i++) //vertical
  {
    line(offX + i * cellSize, offY, offX + i * cellSize, offY + numCellsY * cellSize);
  }

  rect(offX, offY, numCellsX * cellSize, numCellsY * cellSize);
}

function cellObject(i, j) {
  this.i = i;
  this.j = j;
  this.isBomb = false;
  this.isFlagged = false;
  this.value = '';
  this.revealed = false;
  this.foreColor = '';
  this.bombForeColor = color(220, 0, 0, 175);
  this.flagForeColor = color(190, 0, 190);
  this.nonRevealedForeColor = color(0, 0, 0, 100);
  this.outBackColor = color(0, 0);
  this.overBackColor = color(0, 50);
  this.zeroBackColor = color(0, 80);
  this.numBackColor = color(0, 20);
  this.bombBackColor = color(255, 0, 0, 75);
  this.rightBackColor = color(0, 255, 0, 100);
  this.wrongBackColor = color(255, 0, 0, 100);
  this.curBackColor = this.outBackColor;
  this.btn = createButton('');
  this.btn.size(cellSize, cellSize);
  this.btn.position(offX + i * cellSize, offY + j * cellSize);
  this.btn.style('background', this.curBackColor);
  this.btn.style('border', 'none');
  this.btn.style('font', `bold ${cellSize * 0.5}px Courier New`);
  this.btn.style('user-select', 'none');
  this.btn.style('outline-style', 'none');
  this.btn.mouseOver(function () { cellOver(cells[i][j]); });
  this.btn.mouseOut(function () { cellOut(cells[i][j]); });
  this.btn.mouseClicked(function () { cellClick(cells[i][j]); });
  this.btn.mousePressed(function () { cellPress(cells[i][j]); });
}

function cellOver(cell) {
  if (!cell.revealed) {
    cell.btn.style('background', cell.overBackColor);
  }
}

function cellOut(cell) {
  if (!cell.revealed) {
    cell.btn.style('background', cell.curBackColor);
  }
}

function cellClick(cell) {
  if (!cell.revealed && !cell.isFlagged) {
    cell.revealed = true;
    cellsRevealed++;
    if (cell.isBomb) {
      cell.btn.style('background', cell.curBackColor);
      gameOver();
    }
    else {
      if (cell.value == 0) {
        cell.curBackColor = cell.zeroBackColor;
        const neighbors = getNeighbors(cell.i, cell.j);
        for (let i = 0; i < neighbors.length; i++) {
          cellClick(cells[neighbors[i].i][neighbors[i].j]);
        }
      }
      else {
        cell.btn.html(cell.value);
        cell.curBackColor = cell.numBackColor;
      }
      cell.btn.style('background', cell.curBackColor);
      if (cellsRevealed >= numCellsX * numCellsY - numBombs) {
        victory();
      }
    }
  }
}

function cellPress(cell) {
  if (!started && mouseButton === LEFT) {
    genBombs(cell.i, cell.j);
    genValues();
    started = true;
  }
  else if (started && mouseButton === RIGHT && !cell.revealed) {
    if (cell.isFlagged) {
      cell.btn.html('');
      cell.isFlagged = false;
      cell.btn.style('color', cell.foreColor);
    }
    else {
      cell.btn.html(flagChar);
      cell.isFlagged = true;
      cell.btn.style('color', cell.flagForeColor);
    }
  }
}

function getNeighbors(i, j) {
  const neighbors = [],
    coords = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (let k = 0; k < coords.length; k++) {
    const current = (cells[i + coords[k][0]]) ? cells[i + coords[k][0]][j + coords[k][1]] : false;

    if (current) {
      neighbors.push(current);
    }
  }
  return neighbors;
}

function genBombs(i, j) {
  const neighbors = getNeighbors(i, j);
  let count = 0;

  while (count < numBombs) {
    const iRand = floor(random(numCellsX)),
      jRand = floor(random(numCellsY));
    let ok = true;

    for (let k = 0; k < neighbors.length; k++) {
      if (cells[iRand][jRand] === neighbors[k]) {
        ok = false;
        break;
      }
    }
    if (cells[i][j] != cells[iRand][jRand] && ok && !cells[iRand][jRand].isBomb) {
      cells[iRand][jRand].isBomb = true;
      count++;
    }
  }
}

function genValues() {
  for (let j = 0; j < numCellsY; j++) {
    for (let i = 0; i < numCellsX; i++) {
      if (cells[i][j].isBomb) {
        cells[i][j].value = bombChar;
        cells[i][j].foreColor = cells[i][j].bombForeColor;
      }
      else {
        const neighbors = getNeighbors(i, j);
        let count = 0;
        for (let k = 0; k < neighbors.length; k++) {
          if (neighbors[k].isBomb) {
            count++;
          }
        }
        if (count != 0) {
          const colors = [
            color(0, 0, 255),
            color(0, 125, 0),
            color(255, 0, 0),
            color(0, 0, 125),
            color(125, 0, 0),
            color(0, 125, 125),
            color(0, 0, 0),
            color(125, 125, 125),
          ];
          cells[i][j].foreColor = colors[count - 1];
        }
        cells[i][j].value = (count == 0) ? '' : count;
      }
      cells[i][j].btn.style('color', cells[i][j].foreColor);
    }
  }
}

function gameOver() {
  console.log('GAME OVER!');
  for (let j = 0; j < numCellsY; j++) {
    for (let i = 0; i < numCellsX; i++) {
      cells[i][j].btn.html(cells[i][j].value);
      if (!cells[i][j].revealed) {
        cells[i][j].btn.style('color', cells[i][j].nonRevealedForeColor);
      }
      if (cells[i][j].isBomb) {
        cells[i][j].btn.style('color', cells[i][j].bombForeColor);
        if (cells[i][j].isFlagged) {
          cells[i][j].btn.style('background', cells[i][j].rightBackColor);
        }
      }
      if (!cells[i][j].isBomb && cells[i][j].isFlagged) {
        cells[i][j].btn.style('background', cells[i][j].wrongBackColor);
      }
      cells[i][j].revealed = true;
    }
  }
}

function victory() {
  console.log('YOU WIN!');

  for (let j = 0; j < numCellsY; j++) {
    for (let i = 0; i < numCellsX; i++) {
      if (!cells[i][j].revealed) {
        cells[i][j].btn.html(cells[i][j].value);
        cells[i][j].btn.style('background', cells[i][j].rightBackColor);
        cells[i][j].btn.style('color', cells[i][j].bombForeColor);
        cells[i][j].revealed = true;
      }
    }
  }
}