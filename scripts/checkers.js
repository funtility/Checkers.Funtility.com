var initCheckers = function(){
    //window.addEventListener("resize",resizeUi());
    resizeUi();
}

var resizeUi = function(){
    let main = document.querySelector("main");
    console.log("fucking ok");
    let body = main.parentElement;
    let xBody = body.clientWidth;
    let yBody = body.clientHeight;
    console.log(xBody + "," + yBody);
    
    main.setAttribute("style","width:"+xBody+"px;height:"+yBody+"px;");

    drawBoard();
    // main.setAttribute("width",xBody);
    // main.setAttribute("height",yBody);
}

var drawBoard = function(){
    let board = document.getElementById("board");
    for(let row=0; row<8; row++){
        for(let col=0; col<8; col++){
            let cell = document.createElement("div");
            let coord = row+"_"+col;
            cell.setAttribute("id",coord);
            cell.classList.add("cell");
            cell.innerText = coord;
            board.appendChild(cell);
        }
    }
}

var checkerBoard = {};
class checkerCell {
    constructor(){
        this.x;
        this.y;
        this.peice;
        this.class;
    }
};