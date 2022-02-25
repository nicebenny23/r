const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class ArmorCell extends BodyCell{
    constructor(org, loc_col, loc_row, skip_distance_whatever=false){
        super(CellStates.armor, org, loc_col, loc_row, skip_distance_whatever);
    }

    static fromSaveJSON(json, org) {
        let cell = new ArmorCell(org, null, null, true);
        cell.state = CellStates[json.state];
        cell.loc_col = json.col;
        cell.loc_row = json.row;
        return cell;
    }
}

module.exports = ArmorCell;