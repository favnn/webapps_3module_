function stopPage() {
	location.reload();
}

var map = [];
		var start = null;
		var end = null;

		// Создание таблицы карты с заданным размером
		function createMap(size) {
			var table = document.getElementById("map");
			table.innerHTML = "";
			for (var i = 0; i < size; i++) {
				var row = document.createElement("tr");
				map[i] = [];
				for (var j = 0; j < size; j++) {
					var cell = document.createElement("td");
					cell.addEventListener("click", cellClickHandler);
					row.appendChild(cell);
					map[i][j] = 0;
				}
				table.appendChild(row);
			}
		}

		// Обработчик клика на ячейку карты
		function cellClickHandler(event) {
			var cell = event.target;
			var i = cell.parentNode.rowIndex;
			var j = cell.cellIndex;
			if (cell.classList.contains("start")) {
				start = null;
				cell.classList.remove("start");
			} else if (cell.classList.contains("end")) {
				end = null;
				cell.classList.remove("end");
			} else if (cell.classList.contains("block")) {
				map[i][j] = 0;
				cell.classList.remove("block");
			} else {
				if (!start) {
					start = {i: i, j: j};
					cell.classList.add("start");
				} else if (!end) {
					end = {i: i, j: j};
					cell.classList.add("end");
				} else {
					map[i][j] = 1;
					cell.classList.add("block");
				}
			}
		}

		// Вывод найденного пути на карту
		function showPath(path) {
			for (var i = 0; i < path.length; i++) {
				var cell = document.getElementById("map").rows[path[i].i].cells[path[i].j];
				cell.classList.add("path");
			}
		}
        function findPathAStar() {
  // Проверка наличия начальной и конечной точек
  if (!start || !end) {
    alert("Не заданы начальная и/или конечная точки");
    return;
  }

  // Создание массивов открытых и закрытых узлов
  var open = [];
  var closed = [];

  // Добавление начального узла в массив открытых узлов
  open.push({ i: start.i, j: start.j, g: 0, h: Math.abs(end.i - start.i) + Math.abs(end.j - start.j), f: 0, parent: null });

  // Пока не найден путь и есть доступные узлы
  while (open.length > 0) {
    // Поиск узла с наименьшей оценкой f
    var currentNode = open[0];
    var currentIndex = 0;
    for (var i = 1; i < open.length; i++) {
      if (open[i].f < currentNode.f) {
        currentNode = open[i];
        currentIndex = i;
      }
    }

    // Помещение текущего узла в массив закрытых узлов
    open.splice(currentIndex, 1);
    closed.push(currentNode);

    // Если найдена конечная точка, вывод пути
    if (currentNode.i == end.i && currentNode.j == end.j) {
      var path = [];
      var current = currentNode;
      while (current) {
        path.push({ i: current.i, j: current.j });
        current = current.parent;
      }
      showPath(path.reverse());
      return;
    }

    // Обработка соседних узлов
    for (var i = currentNode.i - 1; i <= currentNode.i + 1; i++) {
      for (var j = currentNode.j - 1; j <= currentNode.j + 1; j++) {
        // Пропуск текущего узла и узлов за пределами карты
        if ((i == currentNode.i && j == currentNode.j) || i < 0 || j < 0 || i >= map.length || j >= map[0].length) {
          continue;
        }

        // Вычисление стоимости перемещения к соседнему узлу
        var g = currentNode.g + 1;
        if (i != currentNode.i && j != currentNode.j) {
          g += 1;
        }

        // Проверка наличия соседнего узла в списке закрытых узлов
        var inClosed = false;
        for (var k = 0; k < closed.length; k++) {
          if (closed[k].i == i && closed[k].j == j) {
            inClosed = true;
            break;
          }
        }

        // Если соседний узел уже закрыт или является препятствием, пропуск его
        if (inClosed || map[i][j] == 1) {
          continue;
        }

        // Проверка на наличие соседнего узла в списке открытых узлов
var inOpen = false;
for (var k = 0; k < open.length; k++) {
if (open[k].i == i && open[k].j == j) {
inOpen = true;
break;
}
}
    // Если соседний узел не находится в списке открытых узлов, добавление его
    if (!inOpen) {
      var h = Math.abs(end.i - i) + Math.abs(end.j - j);
      var f = g + h;
      open.push({ i: i, j: j, g: g, h: h, f: f, parent: currentNode });
    }

    // Если соседний узел уже находится в списке открытых узлов, обновление его параметров, если новый путь лучше
    else {
      for (var k = 0; k < open.length; k++) {
        if (open[k].i == i && open[k].j == j) {
          var newG = currentNode.g + 1;
          if (i != currentNode.i && j != currentNode.j) {
            newG += 1;
          }
          if (newG < open[k].g) {
            open[k].g = newG;
            open[k].f = open[k].g + open[k].h;
            open[k].parent = currentNode;
          }
          break;
        }
      }
    }
  }
}
}

// Если путь не найден, вывод сообщения
alert("Путь не найден");
}
	// Обработчик клика на кнопке "Сгенерировать карту"
	document.getElementById("generate").addEventListener("click", function() {
		var size = document.getElementById("size").value;
		createMap(size);
	});

	// Обработчик клика на кнопке "Найти путь"
	document.getElementById("start").addEventListener("click", function() {
		findPathAStar();
	});