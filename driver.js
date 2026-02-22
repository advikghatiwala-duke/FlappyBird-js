window.addEventListener('load', () => {
  const canvas = document.getElementById('main');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let myGamePiece;
  let myBackground;
  let myScore;
  const myObstacles = [];

  const myGameArea = {
    canvas: canvas,
    start() {
      this.context = this.canvas.getContext('2d');
      this.frameNo = 0;
      if (this.interval) clearInterval(this.interval);
      this.interval = setInterval(updateGameArea, 20);
      this.keys = [];
      window.addEventListener('keydown', function (e) {
        myGameArea.keys[e.keyCode] = true;
      });
      window.addEventListener('keyup', function (e) {
        myGameArea.keys[e.keyCode] = false;
      });
      window.addEventListener('resize', () => {
        myGameArea.canvas.width = window.innerWidth;
        myGameArea.canvas.height = window.innerHeight;
        if (myBackground) {
          myBackground.width = myGameArea.canvas.width;
          myBackground.height = myGameArea.canvas.height;
        }
      });
    },
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop() {
      clearInterval(this.interval);
    }
  };

  function component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0.05;
    this.gravitySpeed = 0;
    this.bounce = 0.6;
    if (type === "image" || type === "background") {
      this.image = new Image();
      this.image.src = color;
    }
    this.update = function() {
      const ctx = myGameArea.context;
      if (type === "image" || type === "background") {
        if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
          ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
          if (type === "background") {
            ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
          }
        } else {
          ctx.fillStyle = '#ff00ff';
          ctx.fillRect(this.x, this.y, Math.min(100, this.width), Math.min(100, this.height));
        }
      } else if (this.type === "text") {
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    };
    this.newPos = function() {
      this.gravitySpeed += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY + this.gravitySpeed;
      if (this.type === "background") {
        this.x += this.speedX;
        if (this.x <= -this.width) this.x = 0;
      }
      this.hitBottom();
    };
    this.hitBottom = function() {
      const rockbottom = myGameArea.canvas.height - this.height;
      if (this.y > rockbottom) {
        this.y = rockbottom;
        this.gravitySpeed = -(this.gravitySpeed * this.bounce);
      }
      if (this.y < 0) {
        this.y = 0;
        this.gravitySpeed = 0;
      }
    };
    this.crashWith = function(otherobj) {
      const myleft = this.x;
      const myright = this.x + this.width;
      const mytop = this.y;
      const mybottom = this.y + this.height;
      const otherleft = otherobj.x;
      const otherright = otherobj.x + otherobj.width;
      const othertop = otherobj.y;
      const otherbottom = otherobj.y + otherobj.height;
      if (
        mybottom < othertop ||
        mytop > otherbottom ||
        myright < otherleft ||
        myleft > otherright
      ) {
        return false;
      }
      return true;
    };
  }

  function everyinterval(n) {
    return (myGameArea.frameNo / n) % 1 === 0;
  }

  function startGame() {
    myGameArea.start();
    myGamePiece = new component(
      120,
      164,
      "gamePieceMain.png",
      50,
      Math.floor(myGameArea.canvas.height / 2) - 82,
      "image"
    );
    myBackground = new component(
      myGameArea.canvas.width,
      myGameArea.canvas.height,
      "main_bg.png",
      0,
      0,
      "background"
    );
    myScore = new component("30px", "Courier New", "black", 20, 40, "text");
  }

  function accelerate(n) {
    if (myGamePiece) myGamePiece.gravity = n;
  }

  function updateGameArea() {
    for (let i = 0; i < myObstacles.length; i += 1) {
      if (myGamePiece && myGamePiece.crashWith(myObstacles[i])) {
        myGamePiece.image.src = "gamePieceTertiary.png";
        myGameArea.stop();
        return;
      }
    }

    myGameArea.clear();

    if (myBackground) {
      myBackground.speedX = -2;
      myBackground.newPos();
      myBackground.update();
    }

    myGameArea.frameNo += 1;

    if (myGameArea.frameNo === 1 || everyinterval(150)) {
      const x = myGameArea.canvas.width;
      const minHeight = 20;
      const maxHeight = 200;
      const minWidth = 50;
      const maxWidth = 200;
      const width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      const minGap = 250;
      const maxGap = 275;
      const gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

      const bottomHeightRaw = myGameArea.canvas.height - topHeight - gap;
      const bottomHeight = Math.max(0, bottomHeightRaw);

      if (topHeight > 0) {
        myObstacles.push(new component(width, topHeight, "green", x, 0));
      }
      if (bottomHeight > 0) {
        const bottomY = topHeight + gap;
        myObstacles.push(new component(width, bottomHeight, "green", x, bottomY));
      }
    }

    for (let i = myObstacles.length - 1; i >= 0; i--) {
      myObstacles[i].x -= 10;
      myObstacles[i].update();
      if (myObstacles[i].x + myObstacles[i].width < 0) {
        myObstacles.splice(i, 1);
      }
    }

    if (myScore) {
      myScore.text = "SCORE: " + myGameArea.frameNo;
      myScore.update();
    }

    if (myGamePiece) {
      myGamePiece.speedX = 0;
      myGamePiece.speedY = 0;
      myGamePiece.image.src = "gamePieceMain.png";
      if (myGameArea.keys && myGameArea.keys[37]) {
        myGamePiece.speedX = -5;
        myGamePiece.image.src = "gamePieceSecondary.png";
      }
      if (myGameArea.keys && myGameArea.keys[39]) {
        myGamePiece.speedX = 5;
        myGamePiece.image.src = "gamePieceSecondary.png";
      }
      if (myGameArea.keys && myGameArea.keys[38]) {
        myGamePiece.speedY = -5;
        myGamePiece.image.src = "gamePieceSecondary.png";
        accelerate(-0.01);
      } else if (myGameArea.keys && myGameArea.keys[40]) {
        myGamePiece.speedY = 5;
        myGamePiece.image.src = "gamePieceSecondary.png";
        accelerate(0.01);
      }
      myGamePiece.newPos();
      myGamePiece.update();
    }
  }

  startGame();
});