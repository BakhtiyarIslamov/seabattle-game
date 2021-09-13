import { createMatrix, randomNumber } from './helpers.js';
import { Ship } from './Ship.js';

// Состояния клеток
const gridCellState = {
    empty: 0,
    ship: 1,
    miss: 2,
    hit: 3,
    sunk: 4,
};

class Gameboard {
    constructor(size) {
        this.size = size;
        this.ships = [];
        this.shipsLeft = 0;
        this.grid = createMatrix(this.size, gridCellState.empty);
    }

    // Очиска игрового поля
    clearGrid() {
        this.grid = createMatrix(this.size, gridCellState.empty);
    }

    // Расстановка кораблей
    arrangeShips(newShips) {
        this.clearGrid();
        this.ships = newShips;
        this.shipsLeft = newShips.length;

        this.ships.forEach(arrangeShip.bind(this));

        function arrangeShip(ship) {
            let x, y, dir;
            let isPossible;

            while (true) {
                // Генерация случайных координат
                x = randomNumber(this.size);
                y = randomNumber(this.size);

                // Гененрация направления
                dir = randomNumber(4);

                isPossible = true;

                // Проверка на смежные корабли
                if (
                    this.grid[x][y] == gridCellState.ship ||
                    this.grid[x][y + 1] == gridCellState.ship ||
                    this.grid[x][y - 1] == gridCellState.ship ||
                    (this.grid[x + 1] &&
                        (this.grid[x + 1][y] == gridCellState.ship ||
                            this.grid[x + 1][y + 1] == gridCellState.ship ||
                            this.grid[x + 1][y - 1] == gridCellState.ship)) ||
                    (this.grid[x - 1] &&
                        (this.grid[x - 1][y] == gridCellState.ship ||
                            this.grid[x - 1][y + 1] == gridCellState.ship ||
                            this.grid[x - 1][y - 1] == gridCellState.ship))
                ) {
                    isPossible = false;
                }

                // Располагаем корабль по его направлению с проверкой на смежные корабли и выход за пределы поля
                for (let i = 0; i < ship.length; i++) {
                    switch (dir) {
                        case 0:
                            x++;
                            break;
                        case 1:
                            y++;
                            break;
                        case 2:
                            x--;
                            break;
                        case 3:
                            y--;
                            break;
                    }

                    if (x < 0 || y < 0 || x >= this.size || y >= this.size) {
                        isPossible = false;
                        break;
                    }

                    if (
                        this.grid[x][y] == gridCellState.ship ||
                        this.grid[x][y + 1] == gridCellState.ship ||
                        this.grid[x][y - 1] == gridCellState.ship ||
                        (this.grid[x + 1] &&
                            (this.grid[x + 1][y] == gridCellState.ship ||
                                this.grid[x + 1][y + 1] == gridCellState.ship ||
                                this.grid[x + 1][y - 1] ==
                                    gridCellState.ship)) ||
                        (this.grid[x - 1] &&
                            (this.grid[x - 1][y] == gridCellState.ship ||
                                this.grid[x - 1][y + 1] == gridCellState.ship ||
                                this.grid[x - 1][y - 1] == gridCellState.ship))
                    ) {
                        isPossible = false;
                        break;
                    }
                }

                // В случае возможности размещения корабля заносим его координаты на поле в обратном порядке
                if (isPossible) {
                    for (let i = 0; i < ship.length; i++) {
                        this.grid[x][y] = gridCellState.ship;
                        ship.location.push([x, y]);

                        switch (dir) {
                            case 0:
                                x--;
                                break;
                            case 1:
                                y--;
                                break;
                            case 2:
                                x++;
                                break;
                            case 3:
                                y++;
                                break;
                        }
                    }

                    break;
                }
            }
        }
    }

    // Принять атаку и вернуть результат
    getAttack(x, y) {
        // Проверка попадания
        if (this.grid[x][y] == gridCellState.ship) {
            // Отметить попадание
            this.grid[x][y] = gridCellState.hit;

            // Отметить смежные клетки по диагонали
            if (this.grid[x + 1]) {
                if (this.grid[x + 1][y + 1] == gridCellState.empty) {
                    this.grid[x + 1][y + 1] = gridCellState.miss;
                }
                if (this.grid[x + 1][y - 1] == gridCellState.empty) {
                    this.grid[x + 1][y - 1] = gridCellState.miss;
                }
            }
            if (this.grid[x - 1]) {
                if (this.grid[x - 1][y + 1] == gridCellState.empty) {
                    this.grid[x - 1][y + 1] = gridCellState.miss;
                }
                if (this.grid[x - 1][y - 1] == gridCellState.empty) {
                    this.grid[x - 1][y - 1] = gridCellState.miss;
                }
            }

            // Найти подбитый корабль и отметить удар
            let damagedShip = this.ships.filter((ship) =>
                ship.location
                    .map((elem) => elem.join('-'))
                    .includes([x, y].join('-'))
            )[0];

            damagedShip.getHit([x, y]);

            // Проверка на потонувший корабль
            if (damagedShip.isSunk()) {
                this.noteSunkShip(damagedShip);
            }
            return true;
        } else if (this.grid[x][y] == gridCellState.empty) {
            this.grid[x][y] = gridCellState.miss;
            return false;
        }
    }

    // Отметить потонувший корабль
    noteSunkShip(ship) {
        ship.location.forEach(([x, y]) => {
            this.grid[x][y] = gridCellState.sunk;

            if (this.grid[x][y + 1] == gridCellState.empty) {
                this.grid[x][y + 1] = gridCellState.miss;
            }
            if (this.grid[x][y - 1] == gridCellState.empty) {
                this.grid[x][y - 1] = gridCellState.miss;
            }
            if (this.grid[x + 1]) {
                if (this.grid[x + 1][y] == gridCellState.empty) {
                    this.grid[x + 1][y] = gridCellState.miss;
                }
                if (this.grid[x + 1][y + 1] == gridCellState.empty) {
                    this.grid[x + 1][y + 1] = gridCellState.miss;
                }
                if (this.grid[x + 1][y - 1] == gridCellState.empty) {
                    this.grid[x + 1][y - 1] = gridCellState.miss;
                }
            }
            if (this.grid[x - 1]) {
                if (this.grid[x - 1][y] == gridCellState.empty) {
                    this.grid[x - 1][y] = gridCellState.miss;
                }
                if (this.grid[x - 1][y + 1] == gridCellState.empty) {
                    this.grid[x - 1][y + 1] = gridCellState.miss;
                }
                if (this.grid[x - 1][y - 1] == gridCellState.empty) {
                    this.grid[x - 1][y - 1] = gridCellState.miss;
                }
            }
        });

        this.shipsLeft--;
    }

    isEmpty() {
        return this.shipsLeft == 0 ? true : false;
    }
}

export { Gameboard, gridCellState };
