// Генерация матрицы заданного размера со значениями по умолчанию
const createMatrix = (size, defaultValue) => {
    return Array(size)
        .fill(defaultValue)
        .map(() => Array(size).fill(defaultValue));
};

// Генерация случайного числа от 0 до максимума
const randomNumber = (max) => {
    return Math.floor(Math.random() * max);
};

// Остановка игры для хода компьютера
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export { createMatrix, randomNumber, sleep };
