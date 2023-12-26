// Alpha-Beta Pruning and Checkers
// http://www.cs.columbia.edu/~devans/TIC/AB.html
// https://www.youtube.com/watch?v=STjW3eH0Cik&t=24s


class Checkers{
    constructor(playerOne,playerTwo,playerFirst){
        this.board = new Board();
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.currentPlayer = playerFirst;
        this.history = []; //array of moves
        this.future = []; //array of moves
    }

    //#region Get Moves

    getMoves(player){
        if (player==Players.ONE){

        } else {

        }
    }

    getMove(piece){
        //first we need to know what direction the piece can move
        //then we can check each of those directions
        //
    }

    //#endregion
}

class Board{
    constructor(width = 8, height = 8, fromState = false) {
        this.width = width;
        this.height = height;
        this.tiles = fromState ? fromState : [];
        if (!fromState) {
            this.createTiles();
            this.placePieces();
        }
    }

    // static fromState(tiles) {
    //     return new Board(tiles.length, tiles[0].length, tiles);
    // }

    createTiles() {
        for (x = 0; x < this.width; y++) {
            let col = [x,[]];
            for (y = 0; y < this.height; y++) {
                col[1].push(y);
            }
            this.tiles.push(col);
        }
    }

    placePieces() {
        let coord = null
        this.tiles.forEach(col => {
            col[1].forEach(t => {
                if (col[0] + t % 2 == 1) {
                    if (t < 3) {
                        coord = new Coordinate(col[0],t);
                        col[x][y] = new Piece(Players.ONE,coord);
                    } else if (this.height - t < 3) {
                        coord = new Coordinate(col[0],t);
                        col[x][y] = new Piece(Players.TWO,coord);
                    }
                }
            });
        });
    }

    getValue(player){
        let value = 0;
        this.tiles.forEach(col => {
            col[1].forEach(t => {
                if (isNaN(t) && t.player == player) {
                    value += t.type == PieceType.PAWN ? 3 : 5;
                } else {
                    value -= t.type == PieceType.PAWN ? 3 : 5;
                }
            });
        });
        return value;
    }

    applyMove(move){
        this.tiles[move.origPiece.coord.x][move.origPiece.coord.y] = move.origPiece.coord.y;
        this.tiles[move.destPiece.coord.x][move.destPiece.coord.y] = move.destPiece;
        move.captures.forEach(p => {
            this.tiles[p.coord.x][p.coord.y] = p.coord.y;
        });
    }

    undoMove(move){
        this.tiles[move.origPiece.coord.x][move.origPiece.coord.y] = move.origPiece;
        this.tiles[move.destPiece.coord.x][move.destPiece.coord.y] = move.destPiece.coord.y;
        move.captures.forEach(p => {
            this.tiles[p.coord.x][p.coord.y] = p;
        });
    }

    whatIsAtCoord(coord, currentPlayer){
        result = null;
        if (coord.x < 0 || coord.x > this.width || coord.y < 0 || coord.y > this.height) 
        {
            result = OccupantType.OUT_OF_BOUNDS;
        } else  {
            let piece = this.board.tiles[coord.x][coord.y];
            if (isNaN(piece)){
                if (piece.player = currentPlayer){
                    return OccupantType.PLAYER;
                } else {
                    return OccupantType.OPPONENT;
                }
            } else {
                return OccupantType.EMPTY;
            }
        }        
    }
}

const OccupantType = {
    "PLAYER": 0,
    "OPPONENT": 1,
    "EMPTY": 2,
    "OUT_OF_BOUNDS": 3
}

const PlayerType = {
    "CLIENT": 0,
    "SERVER": 1,
    "COMPUTER": 2,
}

const Players = {
    "ONE": 1,
    "TWO": 2
}

class Player{
    constructor(type, num){
        this.type = type;
        this.num = num;
    }
}

const PieceType = {
    "PAWN": "p",
    "KING": "k",
}

class Piece{
    constructor(player, coord){
        this.player = player;
        this.coord = coord;
        this.type = PieceType.PAWN;
    }
}

const PieceDirection = {
    "NE": 0,
    "SE": 1,
    "SW": 2,
    "NW": 3
}

class Coordinate{
    constructor(x,y){
        this.x = x,
        this.y = y
    }
}

class Move{
    constructor(piece){
        this.origPiece = piece;
        this.destPiece = null;
        this.captures = []; // array of Piece
    }
}