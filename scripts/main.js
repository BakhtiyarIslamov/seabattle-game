import { Ship } from './Ship.js';
import { Gameboard, gridCellState } from './Gameboard.js';
import { Player } from './Player.js';
import { Game, gameStates } from './Game.js';
import { sleep } from './helpers.js';

const GAMEBOARD_SIZE = 10;
const GAMEBOARD_SIZE_PX = 400;
const CELL_SIZE_PX = 40;
const ENEMY_TIME = 500;
let game = null;
let gameView = document.querySelector('#game');

window.onload = () => {
    showWelcomeScreen();
};

// Генерация кораблей, можно добавить другие корабли
const generateShips = () => {
    return [
        new Ship(4),
        new Ship(3),
        new Ship(3),
        new Ship(2),
        new Ship(2),
        new Ship(2),
        new Ship(1),
        new Ship(1),
        new Ship(1),
        new Ship(1),
    ];
};

const showWelcomeScreen = () => {
    let gameName = document.createElement('div');
    let welcomePhrase = document.createElement('div');
    let input = document.createElement('input');
    let gameButton = document.createElement('button');

    gameName.classList.add('text-centered', 'text-big');
    welcomePhrase.classList.add('text-centered');
    input.classList.add('input-big');
    gameButton.classList.add('button-big', 'button');

    input.spellcheck = false;
    input.placeholder = 'Как вас зовут?';
    input.maxLength = 15;
    gameName.innerHTML = 'Морской бой';
    welcomePhrase.innerHTML = 'Добро пожаловать в игру!';
    gameButton.innerHTML = 'Начать игру';

    gameButton.addEventListener('click', () => {
        if (input.value.trim.length != 0) {
            showGameScreen(input.value);
        } else {
            input.value = '';
            input.placeholder = 'Вы забыли написать имя';
        }
    });

    gameView.append(gameName, welcomePhrase, input, gameButton);
};

// Создание окна игры
const showGameScreen = (playerName) => {
    createGame(playerName);

    gameView.innerHTML = '';

    const playerGameboard = document.createElement('div');
    const enemyGameboard = document.createElement('div');
    const gameStateLabel = document.createElement('div');
    const playerNameLabel = document.createElement('div');
    const enemyNameLabel = document.createElement('div');
    const startGameButton = document.createElement('button');
    const arrangeShipsButton = document.createElement('button');

    playerGameboard.classList.add('gameboard-player');
    enemyGameboard.classList.add('gameboard-enemy');
    startGameButton.classList.add('button', 'button-small');
    arrangeShipsButton.classList.add('button', 'button-small');

    playerGameboard.dataset.who = 'player';
    enemyGameboard.dataset.who = 'enemy';

    gameStateLabel.id = 'game-state';
    playerNameLabel.id = 'player-name';
    enemyNameLabel.id = 'enemy-name';
    startGameButton.id = 'start-game';
    arrangeShipsButton.id = 'arrange-ships';

    playerNameLabel.innerHTML = game.player.name;
    enemyNameLabel.innerHTML = game.enemy.name;

    startGameButton.innerHTML = 'Старт';
    arrangeShipsButton.innerHTML = 'Переставить корабли';

    startGameButton.addEventListener('click', () => {
        startGame();
        refreshGameView();
        checkComputerTurn();
    });
    arrangeShipsButton.addEventListener('click', () => {
        game.player.gameboard.arrangeShips(generateShips());
        refreshGameView();
    });

    gameView.append(
        playerGameboard,
        enemyGameboard,
        gameStateLabel,
        playerNameLabel,
        enemyNameLabel,
        startGameButton,
        arrangeShipsButton
    );
    playerGameboard.append(...makeGridView(game.player.gameboard.grid));
    enemyGameboard.append(...makeGridView(game.enemy.gameboard.grid));

    enemyGameboard.addEventListener('click', makeTurnHandler);

    refreshGameView();
};

const startGame = () => {
    game.startGame();

    document.querySelector('#start-game').remove();
    document.querySelector('#arrange-ships').remove();

    const restartButton = document.createElement('button');
    restartButton.classList.add('button', 'button-small');
    restartButton.id = 'restart-button';
    restartButton.innerHTML = 'Начать заново';

    restartButton.addEventListener('click', () => {
        showGameScreen(game.player.name);
    });

    gameView.append(restartButton);
};

// Проверка на ход компьютера
const checkComputerTurn = () => {
    if (game.state == gameStates.enemyTurn) {
        sleep(ENEMY_TIME).then(() => makeComputerTurn());
    }
};

const makeComputerTurn = () => {
    game.computerTurn();
    game.checkIsOver();
    refreshGameView();
    checkComputerTurn();
};

// Функция хода игрока
const makeTurnHandler = (event) => {
    let target = event.target;
    let x = target.dataset.x;
    let y = target.dataset.y;

    if (
        game.state == gameStates.playerTurn &&
        target.classList.contains('cell-empty')
    ) {
        game.playerTurn(Number(x), Number(y));
        game.checkIsOver();
        refreshGameView();
        checkComputerTurn();
    }
};

// Обновление информации о игре
const refreshGameView = () => {
    refreshGameStateView();
    refreshGameboardView('player');
    refreshGameboardView('enemy');
};

const refreshGameStateView = () => {
    let gameStateDOM = document.querySelector('#game-state');
    switch (game.state) {
        case gameStates.preparing:
            gameStateDOM.innerHTML = 'Подготовка к игре';
            break;
        case gameStates.playerTurn:
            gameStateDOM.innerHTML = `Ходит ${game.player.name}`;
            break;
        case gameStates.enemyTurn:
            gameStateDOM.innerHTML = `Ходит ${game.enemy.name}`;
            break;
        case gameStates.gameOver:
            gameStateDOM.innerHTML = `Победил ${game.winner.name}!`;
            break;
    }
};

const refreshGameboardView = (player) => {
    let gameboard = document.querySelector(`[data-who=${player}]`);
    let grid = game[player].gameboard.grid;
    let classes = [
        'cell-empty',
        'cell-ship',
        'cell-miss',
        'cell-hit',
        'cell-sunk',
    ];

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid.length; y++) {
            let cell = gameboard.querySelector(
                `[data-x="${x}"][data-y="${y}"]`
            );

            switch (grid[x][y]) {
                case gridCellState.empty:
                    cell.classList.remove(...classes);
                    cell.classList.add('cell-empty');
                    break;
                case gridCellState.ship:
                    if (
                        player == 'player' ||
                        game.state == gameStates.gameOver
                    ) {
                        cell.classList.remove(...classes);
                        cell.classList.add('cell-ship');
                    } else {
                        cell.classList.add('cell-empty');
                    }
                    break;
                case gridCellState.miss:
                    cell.classList.remove(...classes);
                    cell.classList.add('cell-miss');
                    break;
                case gridCellState.hit:
                    cell.classList.remove(...classes);
                    cell.classList.add('cell-hit');
                    break;
                case gridCellState.sunk:
                    cell.classList.remove(...classes);
                    cell.classList.add('cell-sunk');
                    break;
            }
        }
    }
};

const makeGridView = (grid) => {
    let result = [];

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid.length; y++) {
            let cell = document.createElement('div');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.classList.add('cell');
            cell.style.width = CELL_SIZE_PX + 'px';
            cell.style.height = CELL_SIZE_PX + 'px';
            cell.style.left = CELL_SIZE_PX * x + 'px';
            cell.style.top = CELL_SIZE_PX * y + 'px';
            result.push(cell);
        }
    }

    return result;
};

const createGame = (playerName) => {
    let playerGameboard = new Gameboard(GAMEBOARD_SIZE);
    playerGameboard.arrangeShips(generateShips());

    let enemyGameboard = new Gameboard(GAMEBOARD_SIZE);
    enemyGameboard.arrangeShips(generateShips());

    let player = new Player(playerName, playerGameboard);
    let enemy = new Player('Компьютер', enemyGameboard);

    game = new Game(player, enemy);
};
