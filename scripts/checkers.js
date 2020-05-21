var initCheckers = function(){
    //window.addEventListener("resize",resizeUi());
    resizeUi();
}

var maxRows = 8;
var maxCols = 8;
var cells;
var checkers = [];

var resizeUi = function(){
    let main = document.querySelector("main");
    //console.log("fucking ok");
    let body = main.parentElement;
    let xBody = body.clientWidth;
    let yBody = body.clientHeight;
    //console.log(xBody + "," + yBody);
    
    main.setAttribute("style","width:"+xBody+"px;height:"+yBody+"px;");

    drawBoard();
    newGame();
    // main.setAttribute("width",xBody);
    // main.setAttribute("height",yBody);
}

var drawBoard = function(){
    let board = document.getElementById("board");
    for(let r=1; r<maxRows+1; r++){
        let row = document.createElement("div");
        row.setAttribute("id",r+"r");
        row.classList.add("row");
        for(let col=1; col<maxCols+1; col++){
            let cell = document.createElement("div");
            let oddeven = (col + r) % 2 == 0 ? "even" : "odd";
            let coord = col+"_"+r;
            cell.dataset.x = col;
            cell.dataset.y = r;
            cell.setAttribute("id",coord);
            cell.classList.add("cell", oddeven);
            cell.innerText = coord;
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

var drawCheckers = function(){
    checkers.forEach(checker => drawChecker(checker));
}

var drawChecker = function(checker){
    //console.log(checker);
    for(let i=0; i<cells.length; i++){
        if(checker.x == cells[i].dataset.x && checker.y == cells[i].dataset.y){
            cells[i].classList.remove("player1", "player2", "queend");
            if(checker.queen) cells[i].classList.add("queend");
            cells[i].classList.add("player"+checker.player);
        }
    }
}

var newGame = function(){
    checkers = [];
    cells = document.querySelectorAll(".cell.even");
    //console.log(cells);

    // for each of the first 3 rows add a checker on the even spots for player 1
    let player = 1;
    for(let i=1; i<4; i++){
        let rowCells = document.getElementById(i+"r").childNodes;
        rowCells.forEach(element => newChecker(element,player));
    }

    // for each of the last 3 rows add a checker on the even spots for player 2
    player = 2;
    for(let i=maxRows; i>maxRows-3; i--){
        let rowCells = document.getElementById(i+"r").childNodes;
        rowCells.forEach(element => newChecker(element,player));
    }

    drawCheckers();
}

var newChecker = function(element,player){
    let isEven = (Number.parseInt(element.dataset.x) + Number.parseInt(element.dataset.y)) % 2 == 0 ? true : false;
    if(isEven){
        let c = {
            "x": element.dataset.x ,
            "y": element.dataset.y ,
            "player": player ,
            "queen": false
        }
        checkers.push(c);
    }
}

// var checkerBoard = {};
// class checkerCell {
//     constructor(){
//         this.x;
//         this.y;
//         this.peice;
//         this.class;
//     }
// };