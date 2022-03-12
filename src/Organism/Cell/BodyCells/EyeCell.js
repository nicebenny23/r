const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");
const Directions = require("../../Directions");
const Observation = require("../../Perception/Observation")

class EyeCell extends BodyCell{
    constructor(org, loc_col, loc_row, skip_distance_whatever=false){
        super(CellStates.eye, org, loc_col, loc_row, skip_distance_whatever);
        this.org.anatomy.has_eyes = true;
    }

    static fromSaveJSON(json, org) {
        let cell = new EyeCell(org, null, null, true);
        cell.state = CellStates[json.state];
        cell.loc_col = json.col;
        cell.loc_row = json.row;
        cell.direction = json.direction;
        return cell;
    }

    toSaveJSON() {
        return {...super.toSaveJSON(), ...{ direction: this.direction }}
    }

    initInherit(parent) {
        // deep copy parent values
        super.initInherit(parent);
        this.direction = parent.direction;
    }
    
    initRandom() {
        // initialize values randomly
        this.direction = Directions.getRandomDirection();
    }

    initDefault() {
        // initialize to default values
        this.direction = Directions.up;
    }

    getAbsoluteDirection() {
        var dir = this.org.rotation + this.direction;
        if (dir > 3)
            dir -= 4;
        return dir;
    }

    performFunction() {
        var obs = this.look();
        this.org.brain.observe(obs);
    }

    look() {
        var env = this.org.env;
        var direction = this.getAbsoluteDirection();
        var addCol = 0;
        var addRow = 0;
        switch(direction) {
            case Directions.up:
                addRow = -1;
                break;
            case Directions.down:
                addRow = 1;
                break;
            case Directions.right:
                addCol = 1;
                break;
            case Directions.left:
                addCol = -1;
                break;
        }
        var start_col = this.getRealCol();
        var start_row = this.getRealRow();
        var col = start_col;
        var row = start_row;
        var cell = null;
        for (var i=0; i<Hyperparams.lookRange; i++){
            col+=addCol;
            row+=addRow;
            cell = env.grid_map.cellAt(col, row);
            if (cell == null) {
                break;
            }
            if (cell.state != CellStates.empty){
                var distance = Math.abs(start_col-col) + Math.abs(start_row-row);
                return new Observation(cell, distance, direction);
            }
        }
        return new Observation(cell, Hyperparams.lookRange, direction);
    }
}

module.exports = EyeCell;