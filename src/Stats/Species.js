const Anatomy = require("../Organism/Anatomy");
const CellStates = require("../Organism/Cell/CellStates");

class Species {
    constructor(anatomy, ancestor, start_tick, skip_anatomy_whatever=false) {
        this.anatomy = anatomy;
        // this.ancestor = ancestor; // garbage collect ancestors to avoid memory problems
        this.population = 1;
        this.cumulative_pop = 1;
        this.start_tick = start_tick;
        this.end_tick = -1;
        this.name = '_' + Math.random().toString(36).substr(2, 9);
        this.extinct = false;
        if (!skip_anatomy_whatever)
            this.calcAnatomyDetails();
    }

    static fromSaveJSON(json) {
        let spec = new Species(null, null, null);
        spec.anatomy = new Anatomy(null);
        spec.anatomy.cells = json.anatomy.cells.map(json => BodyCell.fromSaveJSON(json, null));
        spec.anatomy.birth_distance = json.anatomy.birth_distance;
        spec.population = json.population;
        spec.cumulative_pop = json.cumulative_pop;
        spec.start_tick = json.start_tick;
        spec.end_tick = json.end_tick;
        spec.name = json.name;
        spec.extinct = json.extinct;
        return spec;
    }

    toSaveJSON() {
        return {
            anatomy: this.anatomy.toSaveJSON(),
            population: this.population,
            cumulative_pop: this.cumulative_pop,
            start_tick: this.start_tick,
            end_tick: this.end_tick,
            name: this.name,
            extinct: this.extinct,
        }
    }

    calcAnatomyDetails() {
        var cell_counts = {};
        for (let c of CellStates.living) {
            cell_counts[c.name] = 0;
        }
        for (let cell of this.anatomy.cells) {
            cell_counts[cell.state.name]+=1;
        }
        this.cell_counts=cell_counts;
    }

    addPop() {
        this.population++;
        this.cumulative_pop++;
    }

    decreasePop() {
        this.population--;
        if (this.population <= 0) {
            this.extinct = true;
            const FossilRecord = require("./FossilRecord");
            FossilRecord.fossilize(this);
        }
    }

    lifespan() {
        return this.end_tick - this.start_tick;
    }
}

module.exports = Species;