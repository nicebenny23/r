const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class MoverCell extends BodyCell{
    constructor(org, loc_col, loc_row, skip_distance_whatever=false){
        super(CellStates.mover, org, loc_col, loc_row, skip_distance_whatever);
        this.org.anatomy.is_mover = true;
    }

    static fromSaveJSON(json, org) {
        let cell = new MoverCell(org, null, null, true);
        cell.state = CellStates[json.state];
        cell.loc_col = json.col;
        cell.loc_row = json.row;
        return cell;
    }
}

module.exports = MoverCell;