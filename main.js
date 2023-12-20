// Player position variables
let playerX, playerY;
let initialBlockPositions = [];


// Function to start the game
function startGame() {
  movesCounter = 0;
  goalsCounter = 0;
  updateCounters();

  // Store the initial player position
  const initialPlayerTile = document.querySelector(`.${Entities.Character}`);
  const initialPlayerTileId = initialPlayerTile.id.split('y');
  PlayerX = parseInt(initialPlayerTileId[0].split('x')[1]);
  PlayerY = parseInt(initialPlayerTileId[1]);

  // Store the initial block positions
  initialBlockPositions = [];
  const blocks = document.querySelectorAll(`.${Entities.Block}`);
  blocks.forEach(block => {
    const blockId = block.id.split('y');
    const blockX = parseInt(blockId[0].split('x')[1]);
    const blockY = parseInt(blockId[1]);
    initialBlockPositions.push({ x: blockX, y: blockY });
  });
}
// Function to restart the game
function restartGame() {
  movesCounter = 0;
  goalsCounter = 0;
  updateCounters();

  // Reset player position
  const currentPlayerTile = document.querySelector(`.${Entities.Character}`);
  const newPlayerTile = document.getElementById(`x${PlayerX}y${PlayerY}`);

  // Remove the player class from the current tile and add it to the new initial player position
  currentPlayerTile.classList.remove(Entities.Character);
  newPlayerTile.classList.add(Entities.Character);

  // Set player position to initial values
  playerX = PlayerX;
  playerY = PlayerY;

  // Clear all blocks from the board and place them back to initial positions
  const blocksOnBoard = document.querySelectorAll(`.${Entities.Block}, .${Entities.BlockDone}`);
  blocksOnBoard.forEach(block => {
    block.classList.remove(Entities.Block, Entities.BlockDone);
  });

  initialBlockPositions.forEach(blockPos => {
    const newBlockTile = document.getElementById(`x${blockPos.x}y${blockPos.y}`);
    newBlockTile.classList.add(Entities.Block);
  });
}

// Function to update moves and goals counters 
function updateCounters() {
  document.getElementById('moves-counter').innerText = movesCounter;
  document.getElementById('goals-counter').innerText = goalsCounter;
}

// Event listener for the "Start Game" button
document.getElementById('start-btn').addEventListener('click', function() {
  startGame();
});

// Event listener for the "Restart Game" button
document.getElementById('restart-btn').addEventListener('click', function() {
  restartGame();
});

// Retrieve the map container element
const mapContainer = document.getElementById('map');

// Function to generate map elements based on tileMap01
function generateMap() {
  for (let y = 0; y < tileMap01.height; y++) {
    for (let x = 0; x < tileMap01.width; x++) {
      const tile = tileMap01.mapGrid[y][x][0]; 
      const tileElement = document.createElement('div');
      tileElement.id = `x${x}y${y}`;

      switch (tile) {
        case 'W':
          tileElement.classList.add(Tiles.Wall);
          break;
        case 'B':
          tileElement.classList.add(Entities.Block); 
          break;
        case 'P':
          tileElement.classList.add(Entities.Character);

          // Store player position in global variables

          playerX = x;
          playerY = y;
          break;
        case 'G':
          tileElement.classList.add(Tiles.Goal);
          break;
        default:
          tileElement.classList.add(Tiles.Space);
          break;
      }

      mapContainer.appendChild(tileElement);
    }
  }
}


// Event listener for keyboard input
document.addEventListener('keydown', arrowKeys);

// Function to handle arrow key presses
function arrowKeys(event) {
  event.preventDefault();

  // Define movement based on key codes (arrow keys)
  const movement = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  const keyPressed = event.key;
  const move = movement[keyPressed];

  if (move) {
    movePlayer(move.x, move.y);
  }
}
// Function to movePlayer

function movePlayer(moveX, moveY) {
  let moveIsValid = false;

  let targetTiles = [
    document.getElementById("x" + playerX + "y" + playerY), // current player tile
    document.getElementById("x" + (playerX + moveX) + "y" + (playerY + moveY)), // player target tile
    document.getElementById("x" + (playerX + 2 * moveX) + "y" + (playerY + 2 * moveY)) // box target tile
  ];

  let targetTilesClasses = [
    targetTiles[0].classList,
    targetTiles[1].classList,
    targetTiles[2].classList
  ];

  if (targetTilesClasses[1].contains(Tiles.Space) || targetTilesClasses[1].contains(Tiles.Goal)) {
    moveIsValid = true;
  }

  if (targetTilesClasses[1].contains(Entities.Block) && targetTilesClasses[2].contains(Tiles.Space)) {
    moveIsValid = true;
    targetTiles[2].classList.remove(Tiles.Space);
    targetTiles[2].classList.add(Entities.Block);
  }

  if (targetTilesClasses[1].contains(Entities.Block) && targetTilesClasses[2].contains(Tiles.Goal)) {
    moveIsValid = true;
    targetTiles[2].classList.remove(Tiles.Goal);
    targetTiles[2].classList.add(Entities.BlockDone);
    goalsCounter++;
  }

  if (targetTilesClasses[1].contains(Entities.BlockDone) && targetTilesClasses[2].contains(Tiles.Goal)) {
    moveIsValid = true;
    targetTiles[2].classList.remove(Tiles.Goal);
    targetTiles[2].classList.add(Entities.BlockDone);
  }

  if (targetTilesClasses[1].contains(Entities.BlockDone) && targetTilesClasses[2].contains(Tiles.Space)) {
    // Check for available space to move the BlockDone entity
    const lastAvailablePosition = findLastAvailablePosition(playerX + 2 * moveX, playerY + 2 * moveY, moveX, moveY);
    if (lastAvailablePosition) {
      targetTiles[2].classList.remove(Tiles.Space);
      targetTiles[2].classList.add(Entities.Block);
      lastAvailablePosition.classList.remove(Tiles.Space);
      lastAvailablePosition.classList.add(Entities.BlockDone);
    }
    moveIsValid = true;
  }

  if (moveIsValid) {
    movesCounter++;
    updateCounters();

    if (targetTilesClasses[0].contains(Tiles.Goal)) {
      targetTiles[0].classList.add(Tiles.Goal);
    } else {
      targetTiles[0].classList.add(Tiles.Space);
    }

    playerX = playerX + moveX;
    playerY = playerY + moveY;

    targetTiles[0].classList.remove(Entities.Character);
    targetTiles[1].classList = "tile";
    targetTiles[1].classList.add(Entities.Character);
  }

  checkWinCondition();
}

function findLastAvailablePosition(startX, startY, moveX, moveY) {
  let lastAvailablePosition = null;
  let currentX = startX;
  let currentY = startY;

  while (
    document.getElementById("x" + currentX + "y" + currentY) &&
    document.getElementById("x" + currentX + "y" + currentY).classList.contains(Tiles.Space)
  ) {
    lastAvailablePosition = document.getElementById("x" + currentX + "y" + currentY);
    currentX += moveX;
    currentY += moveY;
  }

  return lastAvailablePosition;
}

//function to check win condition
function checkWinCondition() {
  const goalTiles = document.getElementsByClassName(Tiles.Goal);
  const blocks = document.getElementsByClassName(Entities.Block);

  let goalsAchieved = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const { x, y } = extractCoordinates(block.id);

    // Check if the current block is on any of the goal tiles
    let isOnGoal = false;
    for (let j = 0; j < goalTiles.length; j++) {
      const goalTile = goalTiles[j];
      const { x: goalX, y: goalY } = extractCoordinates(goalTile.id);
      if (x === goalX && y === goalY) {
        isOnGoal = true;
        break;
      }
    }

    if (isOnGoal) {
      block.classList.remove(Entities.Block);
      block.classList.add(Entities.BlockDone);
      goalsAchieved++;
    } else {
      block.classList.remove(Entities.BlockDone); 
    }
  }

  // Update the goals counter with the counted number of achieved goals
  goalsCounter = goalsAchieved;
  updateCounters();
}
generateMap();
 


