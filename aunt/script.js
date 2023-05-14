
let points = []; // массив данных для хранения координат точек

const svgchart = document.getElementById('plot')

function stopPage() {
        location.reload();
    }

svgchart.addEventListener("click", function(event) {

// получаем координаты мыши относительно элемента SVG
const rect = svgchart.getBoundingClientRect();

const point = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
}

// сохраняем точку в массив данных
points.push(point);

const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
circle.setAttribute("cx", point.x);
circle.setAttribute("cy", point.y);
circle.setAttribute("r", 5);
circle.setAttribute("fill", "gray");

svgchart.appendChild(circle);
});

function antAlgorithm() {


    /*
    numAntsInput
    evaporationRateInput
    QInput
    alphaInput
    betaInput
    maxIterationsInput
    */
// настройки алгоритма
//const numAnts = 5; // количество муравьев
const numAnts = parseInt(document.getElementById("numAntsInput").value);
//const evaporationRate = 0.1; // скорость испарения феромона
const evaporationRate = parseInt(document.getElementById("evaporationRateInput").value);
//const Q = 1; // константа Q для расчета следа феромона
const Q = parseInt(document.getElementById("QInput").value);
//const alpha = 1; // параметр для влияния на феромон
const alpha = parseInt(document.getElementById("alphaInput").value);
//const beta = 5; // параметр для влияния на расстояние
const beta = parseInt(document.getElementById("betaInput").value);
//const maxIterations = 100; // максимальное количество итераций
const maxIterations = parseInt(document.getElementById("maxIterationsInput").value);

// инициализация матрицы расстояний между точками
const numPoints = points.length;
let distMatrix = new Array(numPoints);
for (let i = 0; i < numPoints; i++) {
distMatrix[i] = new Array(numPoints);
for (let j = 0; j < numPoints; j++) {
const dx = points[i].x - points[j].x;
const dy = points[i].y - points[j].y;
distMatrix[i][j] = Math.sqrt(dx * dx + dy * dy);
}
}

// инициализация матрицы феромонов
let pheromoneMatrix = new Array(numPoints);
for (let i = 0; i < numPoints; i++) {
pheromoneMatrix[i] = new Array(numPoints).fill(1);
}

// функция для вычисления следующего шага муравьев
function getNextStep(currentPoint, visitedPoints, pheromoneMatrix, distMatrix, alpha, beta) {
const unvisitedPoints = points.filter(p => !visitedPoints.includes(p));
const probabilities = [];
let denominator = 0;
for (let i = 0; i < unvisitedPoints.length; i++) {
const nextPoint = unvisitedPoints[i];
const pheromone = pheromoneMatrix[currentPoint][points.indexOf(nextPoint)];
const distance = distMatrix[currentPoint][points.indexOf(nextPoint)];
const probability = Math.pow(pheromone, alpha) * Math.pow(1 / distance, beta);
probabilities.push(probability);
denominator += probability;
}
for (let i = 0; i < probabilities.length; i++) {
probabilities[i] /= denominator;
}
const random = Math.random();
let cumulativeProbability = 0;
for (let i = 0; i < unvisitedPoints.length; i++) {
cumulativeProbability += probabilities[i];
if (random < cumulativeProbability) {
  return unvisitedPoints[i];
}
}
return unvisitedPoints[unvisitedPoints.length - 1];
}

// функция для вычисления длины маршрута
function getTourLength(tour) {
let length = 0;
for (let i = 0; i < tour.length - 1; i++) {
const startPoint = points.indexOf(tour[i]);
const endPoint = points.indexOf(tour[i + 1]);
length += distMatrix[startPoint][endPoint];
}
// Добавляем расстояние от последней точки маршрута до первой
length += distMatrix[points.indexOf(tour[tour.length - 1])][points.indexOf(tour[0])];
return length;
}

// главный цикл алгоритма
let bestTour = points.slice(); // начальное значение лучшего маршрута
let bestLength = getTourLength(bestTour); // начальное значение длины лучшего маршрута
for (let iteration = 0; iteration < maxIterations; iteration++) {
// перемещение муравьев
let antTours = [];
for (let i = 0; i < numAnts; i++) {
let currentPoint = points[Math.floor(Math.random() * numPoints)];
let visitedPoints = [currentPoint];
while (visitedPoints.length < numPoints) {
const nextPoint = getNextStep(points.indexOf(currentPoint), visitedPoints, pheromoneMatrix, distMatrix, alpha, beta);
visitedPoints.push(nextPoint);
currentPoint = nextPoint;
}
const tourLength = getTourLength(visitedPoints);
if (tourLength < bestLength) {
bestTour = visitedPoints.slice();
bestLength = tourLength;
}
antTours.push(visitedPoints);
}
// обновление следов феромонов
for (let i = 0; i < numPoints; i++) {
for (let j = i + 1; j < numPoints; j++) {
let deltaPheromone = 0;
for (let k = 0; k < numAnts; k++) {
  if (antTours[k].includes(points[i]) && antTours[k].includes(points[j])) {
    deltaPheromone += Q / getTourLength(antTours[k]);
  }
}
pheromoneMatrix[i][j] = (1 - evaporationRate) * pheromoneMatrix[i][j] + deltaPheromone;
pheromoneMatrix[j][i] = pheromoneMatrix[i][j];
}
}
}

// вывод лучшего маршрута
const tourPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
let tourString = "";
for (let i = 0; i < bestTour.length; i++) {
const point = bestTour[i];
tourString += (i === 0 ? "M" : " L") + point.x + " " + point.y;
}
tourString += " Z";
tourPath.setAttribute("d", tourString);
tourPath.setAttribute("stroke", "grey");
tourPath.setAttribute("stroke-width", 3);
tourPath.setAttribute("fill", "none");
svgchart.appendChild(tourPath);
}