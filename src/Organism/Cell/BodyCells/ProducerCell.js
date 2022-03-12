const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class ProducerCell extends BodyCell{
    constructor(org, loc_col, loc_row, skip_distance_whatever=false){
        super(CellStates.producer, org, loc_col, loc_row, skip_distance_whatever);
        this.org.anatomy.is_producer = true;
    }

    static fromSaveJSON(json, org) {
        let cell = new ProducerCell(org, null, null, true);
        cell.state = CellStates[json.state];
        cell.loc_col = json.col;
        cell.loc_row = json.row;
        return cell;
    }

    performFunction() {
        if (this.org.anatomy.is_mover && !Hyperparams.moversCanProduce)
            return;
        var env = this.org.env;
        var prob = Hyperparams.foodProdProb;
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();
        if (Math.random() * 100 <= prob) {
            var loc = Hyperparams.growableNeighbors[Math.floor(Math.random() * Hyperparams.growableNeighbors.length)]
            var loc_c=loc[0];
            var loc_r=loc[1];
            var cell = env.grid_map.cellAt(real_c+loc_c, real_r+loc_r);
            if (cell != null && cell.state == CellStates.empty){
                env.changeCell(real_c+loc_c, real_r+loc_r, CellStates.food, null);
                return;
            }
        }
    }
}

module.exports = ProducerCell;
