let points = []; // массив данных для хранения координат точек

const svgchart = document.getElementById('plot')
  
function getDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x)**2 + (point1.y - point2.y)**2);
}

function stopPage() {
	location.reload();
}

function addPoint(x, y, color) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 5);
    circle.setAttribute("fill", color);
    return circle;
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

    const childPoint = addPoint(point.x, point.y, "gray");
    svgchart.appendChild(childPoint);
});

function clearScreen() {
    while (svgchart.firstChild) { // проверяем, есть ли у SVG-элемента дочерние элементы
        svgchart.removeChild(svgchart.firstChild); // удаляем первый дочерний элемент, пока они не закончатся
    }
}

function writeScreen() {
    for (var i = 0; i < points.length; i++) {
        const circle = addPoint(points[i].x, points[i].y, "gray")
        svgchart.appendChild(circle)
    }
}

function kMeansClusterize() 
{
    // функция для нахождения расстояния между двумя точками
    function distance(pointA, pointB) {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }

    // функция для нахождения ближайшего центроида для каждой точки
    function findClosestCentroid(point, centroids) {
        let minDist = Number.MAX_VALUE;
        let closestCentroidIndex = 0;

        for (let i = 0; i < centroids.length; i++) {
            let dist = distance(point, centroids[i]);
            if (dist < minDist) {
                minDist = dist;
                closestCentroidIndex = i;
            }
        }
        return closestCentroidIndex;
    }

    // функция для пересчета центроидов кластеров
    function calculateCentroids(points, clusters) {
        let newCentroids = [];
        for (let i = 0; i < numClusters; i++) {
        let sumX = 0;
        let sumY = 0;
        let numPoints = 0;
        for (let j = 0; j < points.length; j++) {
            if (clusters[j] === i) {
            sumX += points[j].x;
            sumY += points[j].y;
            numPoints++;
            }
        }
        newCentroids.push({ x: sumX / numPoints, y: sumY / numPoints });
        }
        return newCentroids;
    }

    // функция для проверки, изменилось ли распределение точек по кластерам
    function hasConverged(oldCentroids, newCentroids) {
        for (let i = 0; i < numClusters; i++) {
        if (distance(oldCentroids[i], newCentroids[i]) > 0) {
            return false;
        }
        }
        return true;
    }

    clearScreen();
    writeScreen();

    const numClusters = parseInt(document.getElementById("KMeansNInput").value);

    // инициализация центроидов кластеров
    let centroids = [];
    for (let i = 0; i < numClusters; i++) {
        centroids.push(points[Math.floor(Math.random() * points.length)]);
    }

    // распределяем точки по кластерам
    let clusters = [];
    for (let i = 0; i < points.length; i++) {
        clusters.push(findClosestCentroid(points[i], centroids));
    }

    // основной цикл алгоритма
    let oldCentroids;
    do {
        oldCentroids = centroids;
        centroids = calculateCentroids(points, clusters);
        clusters = [];
        for (let i = 0; i < points.length; i++) {
            clusters.push(findClosestCentroid(points[i], centroids));
        }
    } while (!hasConverged(oldCentroids, centroids));

    // раскрашиваем кластеры
    let colors = ["pink", "red", "orange", "purple", "gray"];
    for (let i = 0; i < clusters.length; i++) {
        svgchart.children[i].setAttribute("fill", colors[clusters[i]]);
    }

    // выводим центроиды кластеров
    for (let i = 0; i < numClusters; i++) {
        const centroid = centroids[i];
        svgchart.appendChild(addPoint(centroid.x, centroid.y, "blue"));
    }
}

function dbscanClusterize() 
{
    clearScreen();
    writeScreen();

    // 50 - радиус окрестности
    const eps = parseInt(document.getElementById("dbscanEpsInput").value);
    // 5 - минимальное число точек для формирования кластера
    const minPts = parseInt(document.getElementById("dbscanMinPtsInput").value);

    const clusters = [];
    const visited = new Set(); // множество посещенных точек

    for (let i = 0; i < points.length; i++) {
        if (visited.has(i)) {
        continue; // пропускаем точки, которые уже были обработаны
    }

    visited.add(i);

    const neighbors = getNeighbors(i, eps); // получаем всех соседей точки i в радиусе eps

    if (neighbors.length < minPts) {
      // если в окрестности меньше minPts точек, то это выброс
      continue;
    }

    const cluster = [i]; // новый кластер
    clusters.push(cluster);

    let j = 0;

    while (j < neighbors.length) {
        const neighborIndex = neighbors[j];

        if (!visited.has(neighborIndex)) {
        visited.add(neighborIndex);

        const neighborNeighbors = getNeighbors(neighborIndex, eps);

        if (neighborNeighbors.length >= minPts) {
          // если у соседа достаточно соседей, то добавляем их в список для обработки
          neighbors.push(...neighborNeighbors);
        }
      }

      let found = false;

      // проверяем, не принадлежит ли сосед уже какому-то кластеру
      for (let k = 0; k < clusters.length; k++) {
        if (clusters[k].includes(neighborIndex)) {
          found = true;

          if (!cluster.includes(neighborIndex)) {
            // добавляем соседа к текущему кластеру, если он еще не был добавлен
            cluster.push(neighborIndex);
          }

          break;
        }
      }

      if (!found && !cluster.includes(neighborIndex)) {
        // если сосед не принадлежит ни одному кластеру, добавляем его в текущий
        cluster.push(neighborIndex);
      }

      j++;
    }
  }

  // раскрашиваем точки по кластерам
  for (let i = 0; i < clusters.length; i++) {
    const color = getRandomColor();
    for (let j = 0; j < clusters[i].length; j++) {
      const index = clusters[i][j];
      const circle = svgchart.children[index];
      circle.setAttribute("fill", color);
    }
  }
}

function getNeighbors(pointIndex, eps) {
  const neighbors = [];

  for (let i = 0; i < points.length; i++) {
    if (i !== pointIndex) {
      const dist = distance(points[i], points[pointIndex]);
      if (dist < eps) {
        neighbors.push(i);
      }
    }
  }

  return neighbors;
}

function distance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
let color = "#";
for (let i = 0; i < 6; i++) {
color += letters[Math.floor(Math.random() * 16)];
}
return color;
}

  /* функция, которую я написалa, относится к Агломеративным методам кластеризации. 
  агломеративные методы начинают с того, что каждый объект представляет собой отдельный 
  кластер, и последовательно объединяют близкие кластеры, пока не будет достигнуто заданное 
  число кластеров. в данном случае функция реализует иерархический агломеративный метод, 
  где начинается с N кластеров (N - число объектов) и последовательно объединяет два 
  ближайших кластера до тех пор, пока не достигнет заданного числа кластеров :3
 */
function hierarchicalClusterize() {
  const numClusters = parseInt(document.getElementById("hierarchicalNInput").value);
  const distances = computeDistances(points); // рассчитываем матрицу расстояний между точками

  let clusters = []; // массив кластеров

  // инициализируем каждую точку как отдельный кластер

  for (let i = 0; i < points.length; i++) {
    clusters.push([i]);
  }

  while (clusters.length > numClusters) {
    let minDist = Infinity;
    let minI = -1;
    let minJ = -1;
    // ищем минимальное расстояние между кластерами
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const dist = clusterDistance(clusters[i], clusters[j], distances);
        if (dist < minDist) {
          minDist = dist;
          minI = i;
          minJ = j;
        }
      }
    }

    // объединяем два кластера с минимальным расстоянием
    clusters[minI] = clusters[minI].concat(clusters[minJ]);
    clusters.splice(minJ, 1);
  }

  // раскрашиваем точки в соответствии с кластером
  const colors = ["red", "green", "blue", "cyan", "magenta", "yellow"];
  for (let i = 0; i < clusters.length; i++) {
    const color = colors[i % colors.length];
    for (let j = 0; j < clusters[i].length; j++) {
      const circle = svgchart.childNodes[clusters[i][j]];
      circle.setAttribute("fill", color);
    }
  }
}

// функция для рассчета расстояния между кластерами
function clusterDistance(cluster1, cluster2, distances) {
  let dist = 0;
  for (let i = 0; i < cluster1.length; i++) {
    for (let j = 0; j < cluster2.length; j++) {
      dist += distances[cluster1[i]][cluster2[j]];
    }
  }
  return dist / (cluster1.length * cluster2.length);
}

// функция для рассчета матрицы расстояний между точками
function computeDistances(points) {
  const distances = [];
  for (let i = 0; i < points.length; i++) {
    distances.push([]);
    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        distances[i].push(0);
      } else {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        distances[i].push(Math.sqrt(dx * dx + dy * dy));
      }
    }
  }
  return distances;
}

  