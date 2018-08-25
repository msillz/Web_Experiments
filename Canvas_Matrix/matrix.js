// "use strict"; WHY DOES THIS BREAK CANVAS???
c = document.getElementById("myCanvas");
c.width = document.body.clientWidth; //document.width is obsolete
c.height = document.body.clientHeight; //document.height is obsolete

class streamer{
  constructor(numRows, col, length){
    this.snake = [];
    this.length = length;
    this.rows  = numRows;
    this.col   = col;
    this.alive = true;
    this.createSnake();
  }

  alphaStep(){ // Determines the fade from one to the next
    return (1/this.length)
  }

  createSnake(){
    let alphaStep = this.alphaStep();
    let currAlpha = 1;
    for(let i = 0; i>-this.length; i-=1){
      this.snake.push(
        {"alpha":currAlpha,"row":i}
      );
      currAlpha -= alphaStep;
    }
  }

  ressurectSnake(length){
    this.snake = [];
    this.length = length;
    //this.col = col;
    let alphaStep = this.alphaStep();
    let currAlpha = 1;
    for(let i = 0; i>-length; i-=1){
      this.snake.push(
        {"alpha":currAlpha,"row":i}
      );
      currAlpha -= alphaStep;
    }
    this.alive = true;
  }

  moveSnake(){
    let numOutOfBounds = 0;
    for(let i in this.snake){
      this.snake[i].row += 1;
      if(this.snake[i].row > numRows){
        numOutOfBounds++;
      }
    }
    if(numOutOfBounds >= this.snake.length){
      this.alive = false;
    }
  }
}

class matrixScreen{
  constructor(canvas, fontSize, padding, numCols, numRows, numSnakes, minLength, maxLength, randomizeFactor){
    this.c            = canvas;
    this.ctx          = canvas.getContext('2d');
    this.fontSize     = fontSize;
    this.padding      = padding;
    this.cols         = numCols;
    this.rows         = numRows;
    this.numSnakes    = numSnakes;
    this.minLen       = minLength;
    this.maxLen       = maxLength;
    this.randomizeFactor = randomizeFactor;
    this.matrixArray  = []; // Holds the symbols to be drawn
    this.streamers    = []; // Holds the streamers that map the opacity of the symbols
    this.numStreamers = 0;
    this.iterations   = 0;
    this.initDisplayArray();
    this.initSnakes();
  }

  randomJapChar(){
    //\u30a0-\u30ff
    let select = Math.floor(Math.random()*100);
    let found = false;
    let returnChar = '';

    while(!found){
      if(select < 40){
        returnChar = String.fromCharCode(0x30a0 + Math.random() * (0x30ff-0x30a0 +1)); // Japanese
      } else {
        returnChar = String.fromCharCode(0x0021 + Math.random() * (0x007E-0x0021 +1)); // Punctuation
      }
      if(returnChar != undefined){
        found = true;
      }
    }
    return returnChar;
    //return String.fromCharCode(0x3040 + Math.random() * (0x4DBF-0x3040 +1));
  }

  initDisplayArray(){
    for(let i=0; i<this.cols; i++){
      let newCol = [];
      for(let j=0; j<this.rows; j++){
        newCol.push(this.randomJapChar());
      }
      this.matrixArray.push(newCol);
    }
  }

  assignColumn(){
    return Math.floor(Math.random() * this.cols);
  }

  assignLength(){
    return this.minLen + Math.floor(Math.random() * (this.maxLen-this.minLen));
  }

  initSnakes(){
    for(let i=0; i<this.numSnakes; i++){
      // numRows, col, length
      //this.streamers.push(new streamer(this.rows, this.assignColumn(), this.assignLength()));
      this.streamers.push(new streamer(this.rows, this.numStreamers, this.assignLength()));
      this.numStreamers++;
    }
  }

  moveStreamers(){
    for(let i in this.streamers){
      if(this.streamers[i].alive){
        this.streamers[i].moveSnake();
      } else{
        this.streamers[i].ressurectSnake(this.assignLength());
      }
    }
  }

  clearScreen(){
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);
  }

  drawScreen(){
    //this.ctx.font = toString(this.fontSize)+"px sans-serif";
    //this.ctx.font = "10px sans-serif"; // note, 10px worked well
    this.ctx.font = String(this.fontSize - this.padding)+"px sans-serif";
    this.ctx.fillStyle = "#00FF66";

    for(let i in this.streamers){ // for every streamer
      let currStreamer = this.streamers[i];

      for(let j in currStreamer.snake){
        let currCharCoords = currStreamer.snake[j];

        if((currCharCoords.row >= 0) && (currCharCoords.row < this.rows)){
          this.ctx.globalAlpha = currCharCoords.alpha;
          let val   = this.matrixArray[currStreamer.col][currCharCoords.row];
          let xPos  = this.fontSize*currStreamer.col;
          let yPos  = this.fontSize*currCharCoords.row;

          this.ctx.fillText(val, xPos, yPos);
        }
      }
    }
  }

  randomizeChars(){
    let numToReplace = (this.cols*this.rows)*this.randomizeFactor;
    for(let i=0; i<numToReplace; i++){
      let colReplace = Math.floor(Math.random() * this.cols);
      let rowReplace = Math.floor(Math.random() * this.rows);
      this.matrixArray[colReplace][rowReplace] = this.randomJapChar();
    }
  }


  iterateScreen(){
    // move the streamers
    this.moveStreamers();
    // randomize characters
    this.randomizeChars();
    // clear the screen
    this.clearScreen();
    // draw the new screen
    this.drawScreen();
  }
}

// canvas, fontSize, numCols, numRows, numSnakes, minLength, maxLength
let fontSize = 14; // number of pixels for the letters
let padding = 2;
let numSnakes = 155; // replaced by numCols otherwise some issues occur (corresponds with initSnakes)
let minLength = 15;
let maxLength = 120;

let numCols = c.width  / fontSize;
let numRows = c.height / fontSize;

screenZ0 = new matrixScreen(c, fontSize, padding, numCols, numRows, numCols, minLength, maxLength, .05);

setInterval(function(){
  screenZ0.iterateScreen();
}, 62);
