const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class KillerCell extends BodyCell{
    constructor(org, loc_col, loc_row, skip_distance_whatever=false){
        super(CellStates.killer, org, loc_col, loc_row, skip_distance_whatever);
    }

    static fromSaveJSON(json, org) {
        let cell = new KillerCell(org, null, null, true);
        cell.state = CellStates[json.state];
        cell.loc_col = json.col;
        cell.loc_row = json.row;
        return cell;
    }

    performFunction() {
        var env = this.org.env;
        var c = this.getRealCol();
        var r = this.getRealRow();
        for (var loc of Hyperparams.killableNeighbors) {
            var cell = env.grid_map.cellAt(c+loc[0], r+loc[1]);
            this.killNeighbor(cell);
        }
    }

    killNeighbor(n_cell) {
        // console.log(n_cell)
        if(n_cell == null || n_cell.owner == null || n_cell.owner == this.org || !n_cell.owner.living || n_cell.state == CellStates.armor) 
            return;
        var is_hit = n_cell.state == CellStates.killer; // has to be calculated before death
        n_cell.owner.harm();
        if (Hyperparams.instaKill && is_hit) {
            this.org.harm();
        }
    }
}

module.exports = KillerCell;
