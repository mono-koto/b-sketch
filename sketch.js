const normalEasing = 0.1;
const fastEasing = 0.4;

let easing = normalEasing;

const board = [];
const pieces = [];
let reversing = false;
const reverseMoves = [];
let lastPiece = undefined;
let currentPiece = undefined;

function setup() {
  let renderer = createCanvas(500, 500);
  renderer.parent("container");

  for (let i = 0; i < 5; i++) {
    board.push([]);
    for (let j = 0; j < 5; j++) {
      board[i].push(undefined);
    }
  }

  addPiece(0, 0, "square");
  addPiece(0, 1, "square");
  addPiece(1, 2, "square");
  addPiece(2, 2, "square");
  addPiece(2, 3, "square");
  addPiece(0, 3, "square");
  addPiece(0, 4, "square");
  addPiece(1, 4, "square");
  addPiece(2, 0, "circle");
  addPiece(4, 0, "circle");
  addPiece(4, 2, "circle");
}

function addPiece(x, y, kind) {
  if (board[x][y]) {
    return;
  }
  const piece = {
    kind,
    x,
    y,
  };
  pieces.push(piece);
  board[x][y] = piece;
}

function draw() {
  background(255, 255, 255, reversing ? 100 : 40);
  noStroke();
  fill(0);

  pieces.forEach((piece) => {
    let x = (piece.x * width) / 5;
    let y = (piece.y * height) / 5;
    const w = width / 5;
    if (piece.moveDirection === "up") {
      y -= piece.moveProgress * w;
    } else if (piece.moveDirection === "down") {
      y += piece.moveProgress * w;
    } else if (piece.moveDirection === "left") {
      x -= piece.moveProgress * w;
    } else if (piece.moveDirection === "right") {
      x += piece.moveProgress * w;
    }

    if (piece.kind === "square") {
      rect(x, y, w, w);
    } else if (piece.kind === "circle") {
      const r = 0.5 * w;
      circle(x + r, y + r, r * 1.9);
    }
    if (piece.moveDirection) {
      execMove(piece);
    }
  });

  if (keyIsDown(LEFT_ARROW)) {
    reversing = true;
    easing = fastEasing;
  } else if (keyIsDown(RIGHT_ARROW)) {
    reversing = false;
    easing = fastEasing;
  } else {
    reversing = false;
    easing = normalEasing;
  }

  if (reversing) {
    if (!currentPiece && reverseMoves.length > 0) {
      const move = reverseMoves.pop();
      currentPiece = move.piece;
      currentPiece.moveDirection = move.direction;
    }
  } else if (!currentPiece && frameCount > 60) {
    currentPiece = startMove();
  }
}

function startMove() {
  for (let n = 0; n < 1000; n++) {
    const piece = pieces[floor(random(pieces.length))];
    if (!reversing && piece === lastPiece) {
      break;
    }
    let x = piece.x;
    let y = piece.y;
    piece.moveProgress = 0;
    const direction = random(["up", "down", "left", "right"]);

    const reverseMove = {};
    if (direction === "up" && y > 0 && !board[x][y - 1]) {
      piece.moveDirection = "up";
      reverseMove.direction = "down";
    } else if (direction === "down" && y < 4 && !board[x][y + 1]) {
      piece.moveDirection = "down";
      reverseMove.direction = "up";
    } else if (direction === "left" && x > 0 && !board[x - 1][y]) {
      piece.moveDirection = "left";
      reverseMove.direction = "right";
    } else if (direction === "right" && x < 4 && !board[x + 1][y]) {
      piece.moveDirection = "right";
      reverseMove.direction = "left";
    } else {
      continue;
    }
    reverseMove.piece = piece;
    if (!reversing) {
      reverseMoves.push(reverseMove);
    }
    return piece;
  }
}

function execMove(piece) {
  piece.moveProgress = piece.moveProgress || 0;
  const d = 1 - piece.moveProgress;
  piece.moveProgress += d * (reversing ? fastEasing : easing);

  if (piece.moveProgress <= (reversing ? 0.98 : 0.99)) {
    return;
  }
  piece.moveProgress = 0;
  lastPiece = piece;
  currentPiece = undefined;
  let x = piece.x;
  let y = piece.y;
  board[x][y] = undefined;
  switch (piece.moveDirection) {
    case "up":
      y--;
      break;
    case "down":
      y++;
      break;
    case "left":
      x--;
      break;
    case "right":
      x++;
      break;
  }
  piece.x = x;
  piece.y = y;
  board[x][y] = piece;
  piece.moveDirection = undefined;
}
