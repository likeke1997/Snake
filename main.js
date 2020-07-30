// 节点
var node = {
  game: document.getElementById("game"),
  info: document.getElementById("info"),
  score: document.getElementById("score"),
  progress: document.getElementById("progress"),
  setting: document.getElementById("setting"),
  control: document.getElementById("control"),
};

function Scene() {}

Scene.prototype.init = function () {
  var levelIndex = node.setting.level.value;
  var scaleIndex = node.setting.scale.value;
  var crossIndex = node.setting.cross.value;
  // 初始化属性
  this.setting = {
    level: [3, 5, 10, 15][levelIndex],
    scale: [1, 2, 3, 4][scaleIndex],
    column: [24, 48, 72, 96][scaleIndex],
    row: [16, 32, 48, 64][scaleIndex],
    size: [40, 20, 15, 10][scaleIndex],
    cross: [false, true][crossIndex],
  };
  this.info = {
    framecount: 0,
    score: 0,
  };
  this.snake = {
    direction: [1, 0],
    position: [
      [10, 7],
      [9, 7],
      [8, 7],
    ],
    hasMove: false,
  };
  this.food = {
    position: [],
    progress: 0,
  };
  // 改变边界
  if (this.setting.cross) {
    node.game.style["border-color"] = "gray";
  } else {
    node.game.style["border-color"] = "red";
  }
  // 创建蛇和食物
  this.createSnake();
  this.refreshSnake();
  this.createFood();
  this.refreshFood();
  // 设置更新定时器
  this.updateTimer = setInterval(this.update.bind(this), 17);
  // 设置事件监听器
  document.addEventListener("keydown", this.changeDirection.bind(this), false);
  buttonUp.addEventListener("click", this.changeDirectionUp.bind(this), false);
  buttonDown.addEventListener(
    "click",
    this.changeDirectionDown.bind(this),
    false
  );
  buttonLeft.addEventListener(
    "click",
    this.changeDirectionLeft.bind(this),
    false
  );
  buttonRight.addEventListener(
    "click",
    this.changeDirectionRight.bind(this),
    false
  );
};

Scene.prototype.update = function () {
  // 每17ms更新一次，约为1/60s
  this.info.framecount += 1;
  // 判断蛇是否移动
  if (this.info.framecount >= 30 / this.setting.level) {
    this.info.framecount -= 30 / this.setting.level;
    this.moveSnake();
    this.refreshSnake();
  }
  // 食物槽-
  this.food.progress -= 1;
  node.progress.value = Math.max(0, this.food.progress - 1);
  // 判断蛇是否吃掉食物
  if (
    this.snake.position[0][0] == this.food.position[0] &&
    this.snake.position[0][1] == this.food.position[1]
  ) {
    this.eatFood();
    this.refreshFood();
  }
};

Scene.prototype.changeDirection = function (event, dir) {
  var direction = [0, 0];
  if (event) {
    event.preventDefault();
    dir = event.keyCode;
  }
  switch (dir) {
    case 37: // left
      direction = [-1, 0];
      break;
    case 38: // up
      direction = [0, -1];
      break;
    case 39: // right
      direction = [1, 0];
      break;
    case 40: // down
      direction = [0, 1];
      break;
  }
  if (
    this.snake.hasMove == true &&
    direction[0] != -this.snake.direction[0] &&
    direction[1] != -this.snake.direction[1]
  ) {
    this.snake.direction = direction;
    this.snake.hasMove = false;
  }
};

Scene.prototype.changeDirectionUp = function () {
  this.changeDirection(undefined, 38);
};

Scene.prototype.changeDirectionDown = function () {
  this.changeDirection(undefined, 40);
};

Scene.prototype.changeDirectionLeft = function () {
  this.changeDirection(undefined, 37);
};

Scene.prototype.changeDirectionRight = function () {
  this.changeDirection(undefined, 39);
};

Scene.prototype.createSnake = function () {
  // 创建蛇
  var parent = node.game;
  var snakes = document.getElementsByClassName("snake");
  var length = this.snake.position.length;
  var size = this.setting.size;
  for (let i = snakes.length; i < length; i++) {
    var snake = document.createElement("div");
    snake.className = "snake";
    snake.className += i == 0 ? " head" : " body";
    snake.style.display = "none";
    snake.style.width = size + "px";
    snake.style.height = size + "px";
    parent.appendChild(snake);
  }
};

Scene.prototype.moveSnake = function () {
  // 蛇移动
  var position = this.snake.position[0];
  var direction = this.snake.direction;
  var newPosition = [position[0] + direction[0], position[1] + direction[1]];

  // 更新位置
  this.snake.position.unshift(newPosition);
  this.snake.position.pop();
  this.snake.hasMove = true;

  // 是否撞墙
  if (!this.setting.cross) {
    if (
      newPosition[0] < 0 ||
      newPosition[0] >= this.setting.column ||
      newPosition[1] < 0 ||
      newPosition[1] >= this.setting.row
    ) {
      alert(
        "撞墙啦，你的分数：" +
          this.info.score +
          "。 小蛇长度：" +
          this.snake.position.length +
          "。"
      );
      endGame();
    }
  } else {
    newPosition[0] =
      (newPosition[0] + this.setting.column) % this.setting.column;
    newPosition[1] = (newPosition[1] + this.setting.row) % this.setting.row;
  }

  // 是否撞到自己
  for (let i = 1; i < this.snake.position.length; i++) {
    if (
      newPosition[0] == this.snake.position[i][0] &&
      newPosition[1] == this.snake.position[i][1]
    ) {
      alert(
        "撞到自己啦，你的分数：" +
          this.info.score +
          "。 小蛇长度：" +
          this.snake.position.length +
          "。"
      );
      endGame();
    }
  }
};

Scene.prototype.refreshSnake = function () {
  // 蛇图像更新
  var snakes = document.getElementsByClassName("snake");
  var size = this.setting.size;
  for (let i = 0; i < snakes.length; i++) {
    snakes[i].style.display = "block";
    snakes[i].style.left = this.snake.position[i][0] * size + "px";
    snakes[i].style.top = this.snake.position[i][1] * size + "px";
  }
};

Scene.prototype.createFood = function () {
  // 创建新食物
  var parent = node.game;
  var food = document.createElement("div");
  var size = this.setting.size;
  food.className = "food";
  food.style.width = size + "px";
  food.style.height = size + "px";
  parent.appendChild(food);
};

Scene.prototype.eatFood = function () {
  // 加分
  var basic = 20 * this.setting.level;
  var progress = node.progress.value / 200;
  this.info.score += Math.round(basic * (progress + 0.5));
  node.score.textContent = this.info.score;
  // 添加长度
  var position = this.snake.position[0];
  var direction = this.snake.direction;
  var newPosition = [position[0] - direction[0], position[1] - direction[1]];
  this.snake.position.push(newPosition);
  this.createSnake();
};

Scene.prototype.refreshFood = function () {
  var food = document.getElementsByClassName("food")[0];
  var size = this.setting.size;
  this.food.progress = 200;
  this.food.position = [
    Math.floor(Math.random() * this.setting.column),
    Math.floor(Math.random() * this.setting.row),
  ];
  food.style.left = this.food.position[0] * size + "px";
  food.style.top = this.food.position[1] * size + "px";
};

Scene.prototype.end = function () {
  var parent = node.game;
  var childs = parent.childNodes;
  var length = childs.length;
  for (let i = 0; i < length; i++) {
    parent.removeChild(childs[length - i - 1]);
  }
  node.score.textContent = this.info.score;
  clearInterval(this.updateTimer);
};

var scene,
  button = node.setting["btn-start"],
  buttonUp = node.control["btn-up"],
  buttonDown = node.control["btn-down"],
  buttonLeft = node.control["btn-left"],
  buttonRight = node.control["btn-right"];
button.addEventListener("click", startGame, false);

function startGame() {
  button.disabled = true;
  scene = new Scene();
  scene.init();
}

function endGame() {
  button.disabled = false;
  scene.end();
}

(function adaptiveScreen() {
  var htmlDOM = document.documentElement;
  var rootDOM = document.getElementById("root");
  var htmlWidth = htmlDOM.clientWidth;
  var htmlHeight = htmlDOM.clientHeight;
  var scale = 1;
  if (htmlWidth > htmlHeight) {
    scale =
      htmlWidth / htmlHeight >= 1280 / 640
        ? htmlHeight / 640
        : htmlWidth / 1280;
    rootDOM.style.left = Math.floor((htmlWidth - 1280) / 2) + "px";
    rootDOM.style.top = Math.floor((htmlHeight - 640) / 2) + "px";
    rootDOM.style.transform = `scale(${scale}, ${scale})`;
  } else {
    scale =
      htmlWidth / htmlHeight >= 640 / 1280
        ? htmlHeight / 1280
        : htmlWidth / 640;
    rootDOM.style.left = Math.floor((htmlWidth - 1280) / 2) + "px";
    rootDOM.style.top = Math.floor((htmlHeight - 640) / 2) + "px";
    rootDOM.style.transform = `scale(${scale}, ${scale}) rotate(90deg)`;
  }
})();
