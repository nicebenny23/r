const ArmorCell = require("./ArmorCell");
const EyeCell = require("./EyeCell");
const KillerCell = require("./KillerCell");
const MouthCell = require("./MouthCell");
const MoverCell = require("./MoverCell");
const ProducerCell = require("./ProducerCell");

const TypeMap = {
    armor: ArmorCell,
    eye: EyeCell,
    killer: KillerCell,
    mouth: MouthCell,
    mover: MoverCell,
    producer: ProducerCell
}

module.exports = TypeMap;