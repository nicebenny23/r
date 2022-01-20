const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class BaitCell extends BodyCell{
    constructor(org, loc_col, loc_row){
        super(org, loc_col, loc_row, CellStates.bait);
    }
}

module.exports = BaitCell;