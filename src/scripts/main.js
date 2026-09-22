'use strict';

const Game = require('../modules/Game.class');

const game = new Game();
const cells = [...document.querySelectorAll('.field-cell')];
const gameField = document.querySelector('.game-field');
const score = document.querySelector('.game-score');
const button = document.querySelector('.button');
const startMessage = document.querySelector('.message-start');
const winMessage = document.querySelector('.message-win');
const loseMessage = document.querySelector('.message-lose');
const directions = {
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowUp: 'moveUp',
  ArrowDown: 'moveDown',
};
const swipeThreshold = 30;
let touchStart = null;

function render() {
  game
    .getState()
    .flat()
    .forEach((value, index) => {
      const cell = cells[index];

      cell.textContent = value || '';
      cell.className = 'field-cell';

      if (value) {
        cell.classList.add(`field-cell--${value}`);
      }
    });

  score.textContent = game.getScore();
  startMessage.classList.toggle('hidden', game.getStatus() !== 'idle');
  winMessage.classList.toggle('hidden', game.getStatus() !== 'win');
  loseMessage.classList.toggle('hidden', game.getStatus() !== 'lose');

  const hasStarted = game.getStatus() !== 'idle';

  button.textContent = hasStarted ? 'Restart' : 'Start';
  button.classList.toggle('start', !hasStarted);
  button.classList.toggle('restart', hasStarted);
}

function startGame() {
  if (game.getStatus() === 'idle') {
    game.start();
  } else {
    game.restart();
    game.start();
  }

  render();
}

button.addEventListener('click', startGame);

function move(direction) {
  const moveMethod = directions[direction];

  if (!moveMethod || game.getStatus() !== 'playing') {
    return;
  }

  game[moveMethod]();
  render();
}

document.addEventListener('keydown', (keyEvent) => {
  if (!directions[keyEvent.key] || game.getStatus() !== 'playing') {
    return;
  }

  keyEvent.preventDefault();
  move(keyEvent.key);
});

gameField.addEventListener('touchstart', (touchEvent) => {
  if (game.getStatus() !== 'playing' || touchEvent.touches.length !== 1) {
    touchStart = null;

    return;
  }

  const touch = touchEvent.touches[0];

  touchStart = {
    x: touch.clientX,
    y: touch.clientY,
  };
});

gameField.addEventListener(
  'touchmove',
  (touchEvent) => {
    if (touchStart) {
      touchEvent.preventDefault();
    }
  },
  { passive: false },
);

gameField.addEventListener('touchend', (touchEvent) => {
  if (!touchStart || touchEvent.changedTouches.length === 0) {
    touchStart = null;

    return;
  }

  const touch = touchEvent.changedTouches[0];
  const deltaX = touch.clientX - touchStart.x;
  const deltaY = touch.clientY - touchStart.y;

  touchStart = null;

  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < swipeThreshold) {
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    move(deltaX > 0 ? 'ArrowRight' : 'ArrowLeft');
  } else {
    move(deltaY > 0 ? 'ArrowDown' : 'ArrowUp');
  }
});

gameField.addEventListener('touchcancel', () => {
  touchStart = null;
});

render();
