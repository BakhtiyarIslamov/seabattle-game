class Ship {
    constructor(length) {
        this.length = length;
        this.location = [];
        this.hits = [];
    }

    // Получить координаты удара
    getHit(coordinates) {
        this.hits.push(coordinates);
    }

    // Проверка потоплен ли корабль
    isSunk() {
        return this.length == this.hits.length ? true : false;
    }
}

export { Ship };
