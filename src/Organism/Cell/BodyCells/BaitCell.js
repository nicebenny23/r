const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class BaitCell extends BodyCell{
    constructor(org, loc_col, loc_row){
        super(CellStates.bait, org, loc_col, loc_row);
    }
}

module.exports = BaitCell;