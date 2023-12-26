class Game {
    constructor(args)
    {
        this.squaresPerSide = args.hasOwnProperty("squaresPerSide") ? args.squaresPerSide : 8;
        this.squareSize = args.hasOwnProperty("squareSize") ? args.squareSize : 60;
        this.playerTurn = Player.TWO;
        this.opponent = Player.ONE;

        this.info = document.getElementById("info");
        this.board = document.getElementById("board");
        this.log = document.getElementById("log");
        // this.p1p = document.getElementById("p1p");
        // this.p1k = document.getElementById("p1k");
        // this.p2p = document.getElementById("p2p");
        // this.p2k = document.getElementById("p2k");

        this.selectedPiece = null;
        this.piecesWithMoves = {};

        this.history = [];
        this.future = [];
        
        this.buildBoard();
        this.log.setAttribute('style',`height: ${this.log.clientHeight}px;`);
        this.evaluateTurn();
    }

    //#region Build Board

    buildBoard() {
        // console.log("buildBoard");
        let board = document.getElementById("board");
        for (let rowNum = 1; rowNum <= this.squaresPerSide; rowNum++) {
            this.board.appendChild(this.buildRow(rowNum));
        }
    }
    
    buildRow(rowNum) {
        // console.log("buildRow");
        let row = document.createElement("div");
        for (let colNum = 1; colNum <= this.squaresPerSide; colNum++) {
            row.appendChild(this.buildSquare(rowNum,colNum));
        }
        return row;
    }
    
    buildSquare(rowNum,colNum) {
        // console.log("buildSquare");
        let square = document.createElement("div");
        square.classList.add("square");
        square.classList.add((rowNum + colNum) % 2 == 0 ? "odd" : "even");
        square.setAttribute("style", `width:${this.squareSize};height:${this.squareSize}`);
        square.setAttribute("data-x", colNum);
        square.setAttribute("data-y", rowNum);
        if (square.classList.contains("even")) {
            if (rowNum < 4) {
                square.classList.add("p1");
            }
            if (rowNum > (this.squaresPerSide - 3)) {
                square.classList.add("p2");
            }
        }
        square.addEventListener("click", (e) => { this.playerClick(e.target); });
        return square;
    }

    //#endregion

    playerClick(ele){
        // console.log("playerClick");
        if (this.selectedPiece){
            // if it is a move destination
            let move = this.isMoveDestination(ele);
            if(move){
            // take the move...
                this.movePiece(move);
                this.history.push(move);
                this.evaluateTurn(move);
            } else {
                if (this.isSelectablePiece(ele)){
                    this.selectPiece(ele);
                    this.highlightDestinations();
                } else {
                    this.selectedPiece = null;
                    document.querySelectorAll(".square").forEach(e => {
                        e.classList.remove("selected");
                        // e.classList.remove("movable");
                        e.classList.remove("destination");
                    });
                }
            }
            //    evaluate turn
            // this.selectedPiece = null;
            // this.evaluateTurn();
        } else {
            // console.log(`this.selectedPiece ${this.selectedPiece}`);
            // if piece can be selected
            if (this.isSelectablePiece(ele)){
                // console.log(`this.isSelectablePiece ${this.isSelectablePiece(ele)}`);
                // select piece
                // ele.classList.add("selected");
                this.selectPiece(ele);
                // highlight destinations
                this.highlightDestinations();
            } else {
                // console.log(`this.isSelectablePiece ${this.isSelectablePiece(ele)}`);
                // this.evaluateTurn();
            }
        }
    }

    isSelectablePiece(ele){
        // console.log("isSelectablePiece");
        let name = `x${ele.dataset.x}y${ele.dataset.y}`;
        // TODO Add output for players that lets them know why they can not select
        return this.piecesWithMoves.hasOwnProperty(name);
    }

    isMoveDestination(ele){
        // console.log("isMoveDestination");
        let result = false;
        // console.log(this.selectedPiece);
        this.selectedPiece.forEach(m => {
            if (ele.dataset.x == m.destination.x && ele.dataset.y == m.destination.y){
                result = m;
            }
        });
        return result;
    }

    movePiece(move){
        // console.log("movePiece");
        if (move.opponentPiece){
            this.getElementByCoord(move.opponentPiece.coord).classList.remove(move.opponentPiece.class);
        }
        this.getElementByCoord(move.playerPiece.coord).classList.remove(move.playerPiece.class);
        let kinged = this.kingMe(move);
        this.addToLog(move.getLogMessageObj(kinged));
        this.getElementByCoord(move.destination).classList.add(move.playerPiece.class);
    }

    addToLog(msgObj){
        let div = document.createElement("div");
        div.classList.add(msgObj.class);
        let html = "";
        msgObj.messages.forEach(msg => {
            html += `<div>${msg}</div>`;
        });
        html += '<p style="height:5px;">&nbsp;</p>';
        div.innerHTML = html;
        let first = this.log.firstChild;
        this.log.insertBefore(div,first);
    }

    selectPiece(ele){
        // console.log("selectPiece");
        document.querySelectorAll(".square").forEach(e => {e.classList.remove("selected")})
        ele.classList.add("selected");
        let name = `x${ele.dataset.x}y${ele.dataset.y}`;
        this.selectedPiece = this.piecesWithMoves[name];
    }

    highlightDestinations(){
        // console.log("highlightDestinations");
        document.querySelectorAll(".square").forEach(e => {e.classList.remove("destination")})
        this.selectedPiece.forEach(move => {
            this.getElementByCoord(move.destination).classList.add("destination");
        });
    }

    getElementByCoord(coord){
        return document.querySelector(`[data-x="${coord.x}"][data-y="${coord.y}"]`);
    }

    //#region evaluateTurn

    evaluateTurn(move = false){
        // console.log("evaluateTurn");
        //Deselect everything
        this.piecesWithMoves = {};
        document.querySelectorAll(".square").forEach(e => {
            e.classList.remove("selected");
            e.classList.remove("movable");
            e.classList.remove("destination");
        });
        // console.log(move);
        // console.log(`move.opponentPiece ${move.opponentPiece}`);
        // console.log(`this.isStillInPlay(move) ${this.isStillInPlay(move)}`);
        if (move && move.opponentPiece && this.isStillInPlay(move)){
            // console.log(`evaluateTurn isStillInPlay`);
            // this.selectedPiece = move.playerPiece;
        } else {
            // this.endTurn();

            // console.log(`evaluateTurn !isStillInPlay`);
            this.selectedPiece = null;
            // console.log(`evaluateTurn playerTurn ${this.playerTurn}`);
            this.playerTurn = this.playerTurn == Player.ONE ? Player.TWO : Player.ONE;
            this.opponent = this.opponent == Player.ONE ? Player.TWO : Player.ONE;
            // console.log(`evaluateTurn playerTurn ${this.playerTurn}`);
            this.populatePiecesWithMoves();
        }
        this.setMovablePieces();
        this.updateStats();
        console.log(this.piecesWithMoves);
        // console.log(this.selectedPiece);
    }

    isStillInPlay(move){
        // console.log(`isStillInPlay move ${JSON.stringify(move)}`);
        if (!move) return false;
        // check if the place the piece lands has valid moves and also an opponent
        let landingPiece = new Piece(this.playerTurn,move.playerPiece.type,move.destination);
        // console.log(`isStillInPlay landingPiece ${JSON.stringify(landingPiece)}`);
        let moves = this.getPieceMoves(landingPiece);
        // console.log(`isStillInPlay moves ${JSON.stringify(moves)}`);
        let jumpMoves = [];
        moves.forEach(m => {
            if (m.opponentPiece){
                jumpMoves.push(m);
            }
        });
        // console.log(`isStillInPlay jumpMoves ${JSON.stringify(jumpMoves)}`);
        if (jumpMoves.length > 0){
            move = new Move(landingPiece,move.direction);
            this.piecesWithMoves[`x${landingPiece.coord.x}y${landingPiece.coord.y}`] = jumpMoves;
            this.selectedPiece = jumpMoves;
            this.getElementByCoord(move.playerPiece.coord).classList.add("selected");
            this.highlightDestinations();
            return true;
        }
        return false;
    }

    kingMe(move){
        let result = false;
        if (move.playerPiece.type !== PieceType.KING){
            switch(this.playerTurn){
                case Player.ONE:
                    if (move.destination.y === this.squaresPerSide) {
                        move.playerPiece = new Piece(this.playerTurn,PieceType.KING,move.playerPiece.coord);
                        result = true;
                        // this.endTurn();
                    }
                    break;
                case Player.TWO:
                    if (move.destination.y === 1) {
                        move.playerPiece = new Piece(this.playerTurn,PieceType.KING,move.playerPiece.coord);
                        result = true;
                        // this.endTurn();
                    }
                    break;
            }
        }
        return result;
    }

    endTurn(){
        this.selectedPiece = null;
        this.playerTurn = this.playerTurn == Player.ONE ? Player.TWO : Player.ONE;
        this.opponent = this.opponent == Player.ONE ? Player.TWO : Player.ONE;
        this.populatePiecesWithMoves();

        this.setMovablePieces();
        this.updateStats();
    }

    //#region Populate this.piecesWithMoves
    
    populatePiecesWithMoves(){
        // console.log("populatePiecesWithMoves");
        this.piecesWithMoves = {};
        let pieces = this.getPlayerPieces();
        pieces.forEach(p => {
            let moves = this.getPieceMoves(p);
            if (moves.length > 0){
                this.piecesWithMoves[`x${p.coord.x}y${p.coord.y}`] = moves;
            }
        });
    }

    getPlayerPieces(){
        // console.log("getPlayerPieces");
        let pieces = [];
        document.querySelectorAll(".square").forEach(ele => {
            let p = this.getPlayerPiece(ele);
            if (p) pieces.push(p);
        });
        return pieces;
    }

    getPlayerPiece(ele){
        // console.log("getPlayerPiece");
        let pawn = this.playerTurn == Player.ONE ? "p1" : "p2";
        let king = this.playerTurn == Player.ONE ? "k1" : "k2";
        let coord = new Coordinate(ele.dataset.x, ele.dataset.y);
        if (ele.classList.contains(pawn)) {
            return new Piece(this.playerTurn, PieceType.PAWN, coord);
        }
        else if (ele.classList.contains(king)) {
            return new Piece(this.playerTurn, PieceType.KING, coord);
        } else {
            return false;
        }
    }

    getPieceMoves(piece){
        // console.log("getPieceMoves");
        let moves = [];
        let directions = this.getPieceDirections(piece);
        directions.forEach(dir => {
            let move = new Move(piece, dir);
            if (this.isValidMove(move)){
                moves.push(move);
            }
        });
        return moves;
    }

    getPieceDirections(piece){
        // console.log("getPieceDirections");
        let directions = [];
        if (piece.type === PieceType.PAWN){
            if (this.playerTurn === Player.ONE){
                directions.push(Direction.SE);
                directions.push(Direction.SW);
            } else {
                directions.push(Direction.NE);
                directions.push(Direction.NW);
            }
        } else {
            directions.push(Direction.SE);
            directions.push(Direction.SW);
            directions.push(Direction.NE);
            directions.push(Direction.NW);
        }
        // console.log("end getPieceDirections\n ");
        return directions;
    }

    isValidMove(move){
        // console.log("isValidMove");
        let oneSquareAway = move.destination;
        let twoSquaresAway = move.getNextSquare(oneSquareAway);
        switch(this.whatIsAtCoord(move.destination)){
            case SquareOccupant.OUT_OF_BOUNDS:
                return false;
            case SquareOccupant.EMPTY:
                return true;
            case SquareOccupant.MY_PIECE:
                return false;
            case SquareOccupant.OPPONENT_PAWN:
                // console.log("SquareOccupant.OPPONENT_PAWN");
                // console.log(`oneSquareAway ${JSON.stringify(oneSquareAway)}`);
                // console.log(`twoSquaresAway ${JSON.stringify(twoSquaresAway)}`);
                if (this.whatIsAtCoord(twoSquaresAway) === SquareOccupant.EMPTY){
                    // console.log(`whatIsAtCoord ${JSON.stringify(this.whatIsAtCoord(twoSquaresAway))}`);
                    move.opponentPiece = new Piece(this.opponent, PieceType.PAWN, oneSquareAway);
                    move.destination = twoSquaresAway;
                    // console.log(`destination ${JSON.stringify(move.destination)}`);
                    return true;
                }
                return false;
            case SquareOccupant.OPPONENT_KING:
                if (this.whatIsAtCoord(twoSquaresAway) === SquareOccupant.EMPTY){
                    move.opponentPiece = new Piece(this.opponent, PieceType.KING, oneSquareAway);
                    move.destination = twoSquaresAway;
                    return true;
                }
                return false;
        }
    }

    whatIsAtCoord(coord){
        let ele = document.querySelector(`[data-x="${coord.x}"][data-y="${coord.y}"]`);
        if (!ele){
            return SquareOccupant.OUT_OF_BOUNDS;
        } else {
            let myPawn = this.playerTurn == Player.ONE ? "p1" : "p2";
            let myKing = this.playerTurn == Player.ONE ? "k1" : "k2";
            let theirPawn = this.playerTurn == Player.TWO ? "p1" : "p2";
            let theirKing = this.playerTurn == Player.TWO ? "k1" : "k2";
            if (ele.classList.contains(myPawn) || ele.classList.contains(myKing)){
                return SquareOccupant.MY_PIECE;
            } else if (ele.classList.contains(theirPawn)){
                return SquareOccupant.OPPONENT_PAWN;
            } else if (ele.classList.contains(theirKing)){
                return SquareOccupant.OPPONENT_KING;
            } else {
                return SquareOccupant.EMPTY;
            }
        }
    }

    //#endregion

    setMovablePieces(){
        for (const [key, val] of Object.entries(this.piecesWithMoves)) {
            let xy = key.split("y");
            // console.log(`val ${JSON.stringify(val)}`);
            let ele = document.querySelector(`[data-x="${xy[0].slice(1)}"][data-y="${xy[1]}"]`);
            ele.classList.add("movable");
            // this.getElementByCoord(new Coordinate(xy[0].slice(1),),xy[1]).classList.add("movable");
        }
    }

    updateStats(){
        // console.log("updateStats");
        let p1p_num = document.querySelectorAll(".p1").length;
        let p1k_num = document.querySelectorAll(".k1").length;
        let p2p_num = document.querySelectorAll(".p2").length;
        let p2k_num = document.querySelectorAll(".k2").length;

        let gameover = Object.entries(this.piecesWithMoves).length === 0;

        let message = "";
        let color = "";
        if (p1p_num + p1k_num === 0) {
            message = "Blue Wins!";
            color = "blue";
        } else if (p2p_num + p2k_num === 0) {
            message = "Green Wins!";
            color = "green";
        } else if (gameover) {
            message = this.playerTurn === Player.ONE ? "Blue Wins!" : "Green Wins!";
            color = this.playerTurn === Player.ONE ? "blue" : "green";
        } else {
            message = this.playerTurn === Player.ONE ? "Green's Turn" : "Blue's Turn";
            color = this.playerTurn === Player.ONE ? "green" : "blue";
        }
        this.setInfoMessage(color,message);


        // this.p1p.innerHTML = p1p_num;
        // this.p1k.innerHTML = p1k_num;
        // this.p2p.innerHTML = p2p_num;
        // this.p2k.innerHTML = p2k_num;
        // this.info.innerHTML = message;
    }

    setInfoMessage(color,message){
        this.info.classList.remove("green");
        this.info.classList.remove("blue");
        this.info.classList.add(color);
        this.info.innerHTML=message;
    }

    //#endregion
}

class Piece {
    constructor(player, type, coord){
        // this.player = player;
        this.type = type;
        this.class = `${type}${player}`;
        this.coord = coord;
    }
}

class Coordinate {
    constructor(x = 0, y = 0){
        this.x = parseInt(x);
        this.y = parseInt(y);
    }
}

class Move {
    // constructor(player,playerPiece,origin,direction){
    // constructor(playerPiece,origin,direction){
    constructor(playerPiece,direction){
        // this.player = player;
        this.playerPiece = playerPiece;
        // this.capture = false;
        this.opponentPiece = false;
        // this.origin = origin;
        this.direction = direction;
        this.destination = this.getNextSquare(this.playerPiece.coord);
        // this.destination = this.getNextSquare(this.origin);
    }

    getNextSquare(coord){
        switch(this.direction){
            case Direction.NE:
                return new Coordinate(coord.x + 1, coord.y - 1);
            case Direction.SE:
                return new Coordinate(coord.x + 1, coord.y + 1);
            case Direction.SW:
                return new Coordinate(coord.x - 1, coord.y + 1);
            case Direction.NW:
                return new Coordinate(coord.x - 1, coord.y - 1);
        }
    }

    getLogMessageObj(kinged = false){
        let msgs = [];
        let plrClr = this.playerPiece.class.charAt(1) === "1" ? "Green" : "Blue";
        let plrPce = this.playerPiece.class.charAt(0) === "p" ? "pawn" : "king";

        let plrBeg = this.squarenameFromCoord(this.playerPiece.coord);
        let plrEnd = this.squarenameFromCoord(this.destination);
        let kng = "";
        if (kinged){
            plrPce = "pawn";
            kng = " (kinged)";
        }
        msgs.push(`${plrClr} moves ${plrPce}`);
        msgs.push(`- ${plrBeg} to ${plrEnd}${kng}`);

        let cap = "";
        if (this.opponentPiece){
            let oppClr = this.opponentPiece.class.charAt(1) === "1" ? "green" : "blue";
            let oppPce = this.opponentPiece.class.charAt(0) === "p" ? "pawn" : "king";
            let oppLoc = this.squarenameFromCoord(this.opponentPiece.coord);
            msgs.push(`- Captures ${oppClr} ${oppPce} at ${oppLoc}.`);
        }

        return {"class": plrClr.toLowerCase(), "messages": msgs};
    }

    squarenameFromCoord(coord){
        return `${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(coord.x - 1)}${coord.y}`;
    }
}

//#region Constants

const Player = {
    "ONE": 1,
    "TWO": 2
}

const PieceType = {
    "PAWN": "p",
    "KING": "k" 
}

const Direction = {
    "NE": "north east",
    "SE": "south east",
    "SW": "south west",
    "NW": "north west"
}

const SquareOccupant = {
    "OUT_OF_BOUNDS": 0,
    "EMPTY": 1,
    "MY_PIECE": 2,
    "OPPONENT_PAWN": 3,
    "OPPONENT_KING": 4,
}

//#endregion