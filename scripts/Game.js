import { gridCellState } from './Gameboard.js';
import { randomNumber } from './helpers.js';

// Состояния игры
const gameStates = {
    preparing: 'preparing',
    playerTurn: 'player',
    enemyTurn: 'enemy',
    gameOver: 'gameOver',
};

class Game {
    constructor(player, enemy) {
        this.player = player;
        this.enemy = enemy;
        this.state = gameStates.preparing;
        this.winner = null;
    }

    // Старт игры и случайный выбор того, кто начинает
    startGame() {
        let turn = randomNumber(2);
        this.state = turn == 0 ? gameStates.playerTurn : gameStates.enemyTurn;
    }

    // Ход игрока, при промахе ход переходит компьтеру
    playerTurn(x, y) {
        if (this.enemy.gameboard.getAttack(x, y)) {
            this.state = gameStates.playerTurn;
        } else {
            this.state = gameStates.enemyTurn;
        }
    }

    // Логика хода компьютера, на данный момент стреляет в случайные доступные клетки
    computerTurn() {
        const playerGameboard = this.player.gameboard;
        let x = randomNumber(playerGameboard.size);
        let y = randomNumber(playerGameboard.size);

        while (
            playerGameboard.grid[x][y] == gridCellState.miss ||
            playerGameboard.grid[x][y] == gridCellState.hit ||
            playerGameboard.grid[x][y] == gridCellState.sunk
        ) {
            x = randomNumber(playerGameboard.size);
            y = randomNumber(playerGameboard.size);
        }

        if (playerGameboard.getAttack(x, y)) {
            this.state = gameStates.enemyTurn;
        } else {
            this.state = gameStates.playerTurn;
        }
    }

    // Проверка окончания игры
    checkIsOver() {
        if (this.player.gameboard.isEmpty()) {
            this.state = gameStates.gameOver;
            this.winner = this.enemy;
        }
        if (this.enemy.gameboard.isEmpty()) {
            this.state = gameStates.gameOver;
            this.winner = this.player;
        }
    }
}

export { Game, gameStates };
