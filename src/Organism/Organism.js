const CellStates = require("./Cell/CellStates");
const Neighbors = require("../Grid/Neighbors");
const Hyperparams = require("../Hyperparameters");
const Directions = require("./Directions");
const Anatomy = require("./Anatomy");
const Brain = require("./Perception/Brain");
const FossilRecord = require("../Stats/FossilRecord");

class Organism {
    constructor(col, row, env, parent=null) {
        this.c = col;
        this.r = row;
        this.env = env;
        this.lifetime = 0;
        this.food_collected = 0;
        this.living = true;
        this.anatomy = new Anatomy(this)
        this.direction = Directions.down; // direction of movement
        this.rotation = Directions.up; // direction of rotation
        this.can_rotate = Hyperparams.rotationEnabled;
        this.move_count = 0;
        this.move_range = 4;
        this.ignore_brain_for = 0;
        this.mutability = 5;
        this.addProb = 33;
        this.changeProb = 33;
        this.removeProb = 33;
        this.damage = 0;
        this.brain = new Brain(this);
        if (parent != null) {
            this.inherit(parent);
        }
    }

    inherit(parent) {
        this.move_range = parent.move_range;
        this.mutability = parent.mutability;
        this.addProb = parent.addProb;
        this.changeProb = parent.changeProb;
        this.removeProb = parent.removeProb;
        this.species = parent.species;
        // this.birth_distance = parent.birth_distance;
        for (var c of parent.anatomy.cells){
            //deep copy parent cells
            this.anatomy.addInheritCell(c);
        }
        if(parent.anatomy.is_mover) {
            for (var i in parent.brain.decisions) {
                this.brain.decisions[i] = parent.brain.decisions[i];
            }
        }
    }

    // amount of food required before it can reproduce
    foodNeeded() {
        return this.anatomy.getTotalCost();
    }

    lifespan() {
        return this.anatomy.cells.length * Hyperparams.lifespanMultiplier;
    }

    maxHealth() {
        return this.anatomy.cells.length;
    }

    reproduce() {
        //produce mutated child
        //check nearby locations (is there room and a direct path)
        var org = new Organism(0, 0, this.env, this);
        if(Hyperparams.rotationEnabled){
            org.rotation = Directions.getRandomDirection();
        }
        var prob = this.mutability;
        if (Hyperparams.useGlobalMutability){
            prob = Hyperparams.globalMutability;
        }
        else {
            //mutate the mutability
            if (Math.random() <= 0.5)
                org.mutability++;
            else{ 
                org.mutability--;
                if (org.mutability < 1)
                    org.mutability = 1;
            }
            var amount;
            var mutation_type_mutability = 5;
            //mutate the add probability
            amount = Math.random()*mutation_type_mutability - mutation_type_mutability/2;
            org.addProb += amount;
            org.addProb = Math.min(Math.max(org.addProb, 0), 100);
            org.changeProb -= amount/2;
            org.removeProb -= amount/2;
            //fix the probabilities (floating point errors)
            org.changeProb = Math.min(Math.max(100 - org.addProb - org.removeProb, 0), 100);
            org.removeProb = Math.min(Math.max(100 - org.addProb - org.changeProb, 0), 100);
            //mutate the change probability
            amount = Math.random()*mutation_type_mutability - mutation_type_mutability/2;
            org.changeProb += amount;
            org.changeProb = Math.min(Math.max(org.changeProb, 0), 100);
            org.addProb -= amount/2;
            org.removeProb -= amount/2;
            //fix the probabilities (floating point errors)
            org.addProb = Math.min(Math.max(100 - org.changeProb - org.removeProb, 0), 100);
            org.removeProb = Math.min(Math.max(100 - org.changeProb - org.addProb, 0), 100);
            //mutate the remove probability
            amount = Math.random()*mutation_type_mutability - mutation_type_mutability/2;
            org.removeProb += amount;
            org.removeProb = Math.min(Math.max(org.removeProb, 0), 100);
            org.addProb -= amount/2;
            org.changeProb -= amount/2;
            //fix the probabilities (floating point errors)
            org.addProb = Math.min(Math.max(100 - org.removeProb - org.changeProb, 0), 100);
            org.changeProb = Math.min(Math.max(100 - org.removeProb - org.addProb, 0), 100);
        } 
        var mutated = false;
        if (Math.random() * 100 <= prob) {
            if (org.anatomy.is_mover && Math.random() * 100 <= 10) { 
                if (org.anatomy.has_eyes) {
                    org.brain.mutate();
                }
                org.move_range += Math.floor(Math.random() * 4) - 2;
                if (org.move_range <= 0){
                    org.move_range = 1;
                };
                
            }
            else {
                mutated = org.mutate();
            }
        }

        var direction = Directions.getRandomScalar();
        var direction_c = direction[0];
        var direction_r = direction[1];
        var offset = (Math.floor(Math.random() * 3));
        var basemovement = this.anatomy.birth_distance;
        var new_c = this.c + (direction_c*basemovement) + (direction_c*offset);
        var new_r = this.r + (direction_r*basemovement) + (direction_r*offset);

        // console.log(org.isClear(new_c, new_r, org.rotation, true))
        if (org.isClear(new_c, new_r, org.rotation, true) && org.isStraightPath(new_c, new_r, this.c, this.r, this)){
            org.c = new_c;
            org.r = new_r;
            this.env.addOrganism(org);
            org.updateGrid();
            if (mutated) {
                FossilRecord.addSpecies(org, this.species);
            }
            else {
                org.species.addPop();
            }
        }
        Math.max(this.food_collected -= this.foodNeeded(), 0);

    }

    mutate() {
        let mutated = false;
        if (this.calcRandomChance(this.addProb)) {
            let branch = this.anatomy.getRandomCell();
            let state = CellStates.getRandomLivingType();//branch.state;
            let growth_direction = Neighbors.all[Math.floor(Math.random() * Neighbors.all.length)]
            let c = branch.loc_col+growth_direction[0];
            let r = branch.loc_row+growth_direction[1];
            if (this.anatomy.canAddCellAt(c, r)){
                mutated = true;
                this.anatomy.addRandomizedCell(state, c, r);
            }
        }
        if (this.calcRandomChance(this.changeProb)){
            let cell = this.anatomy.getRandomCell();
            let state = CellStates.getRandomLivingType();
            this.anatomy.replaceCell(state, cell.loc_col, cell.loc_row);
            mutated = true;
        }
        if (this.calcRandomChance(this.removeProb)){
            if(this.anatomy.cells.length > 1) {
                let cell = this.anatomy.getRandomCell();
                mutated = this.anatomy.removeCell(cell.loc_col, cell.loc_row);
            }
        }
        return mutated;
    }

    calcRandomChance(prob) {
        return (Math.random() * 100) < prob;
    }

    attemptMove() {
        var direction = Directions.scalars[this.direction];
        var direction_c = direction[0];
        var direction_r = direction[1];
        var new_c = this.c + direction_c;
        var new_r = this.r + direction_r;
        if (this.isClear(new_c, new_r)) {
            for (var cell of this.anatomy.cells) {
                var real_c = this.c + cell.rotatedCol(this.rotation);
                var real_r = this.r + cell.rotatedRow(this.rotation);
                this.env.changeCell(real_c, real_r, CellStates.empty, null);
            }
            this.c = new_c;
            this.r = new_r;
            this.updateGrid();
            return true;
        }
        return false;
    }

    attemptRotate() {
        if(!this.can_rotate){
            this.direction = Directions.getRandomDirection();
            this.move_count = 0;
            return true;
        }
        var new_rotation = Directions.getRandomDirection();
        if(this.isClear(this.c, this.r, new_rotation)){
            for (var cell of this.anatomy.cells) {
                var real_c = this.c + cell.rotatedCol(this.rotation);
                var real_r = this.r + cell.rotatedRow(this.rotation);
                this.env.changeCell(real_c, real_r, CellStates.empty, null);
            }
            this.rotation = new_rotation;
            this.direction = Directions.getRandomDirection();
            this.updateGrid();
            this.move_count = 0;
            return true;
        }
        return false;
    }

    changeDirection(dir) {
        this.direction = dir;
        this.move_count = 0;
    }

    // assumes either c1==c2 or r1==r2, returns true if there is a clear path from point 1 to 2
    isStraightPath(c1, r1, c2, r2, parent){
        if (c1 == c2) {
            if (r1 > r2){
                var temp = r2;
                r2 = r1;
                r1 = temp;
            }
            for (var i=r1; i!=r2; i++) {
                var cell = this.env.grid_map.cellAt(c1, i)
                if (!this.isPassableCell(cell, parent)){
                    return false;
                }
            }
            return true;
        }
        else {
            if (c1 > c2){
                var temp = c2;
                c2 = c1;
                c1 = temp;
            }
            for (var i=c1; i!=c2; i++) {
                var cell = this.env.grid_map.cellAt(i, r1);
                if (!this.isPassableCell(cell, parent)){
                    return false;
                }
            }
            return true;
        }
    }

    isPassableCell(cell, parent){
        return cell != null && (cell.state == CellStates.empty || cell.owner == this || cell.owner == parent || cell.state == CellStates.food);
    }

    isClear(col, row, rotation=this.rotation) {
        for(var loccell of this.anatomy.cells) {
            var cell = this.getRealCell(loccell, col, row, rotation);
            if (cell==null) {
                return false;
            }
            if (cell.owner==this || cell.state==CellStates.empty || (!Hyperparams.foodBlocksReproduction && cell.state==CellStates.food)){
                continue;
            }
            return false;
        }
        return true;
    }

    harm() {
        this.damage++;
        if (this.damage >= this.maxHealth() || Hyperparams.instaKill) {
            this.die();
        }
    }

    die() {
        for (var cell of this.anatomy.cells) {
            var real_c = this.c + cell.rotatedCol(this.rotation);
            var real_r = this.r + cell.rotatedRow(this.rotation);
            if(Hyperparams.cost[cell.state.name] > 0.001) {
                this.env.changeCell(real_c, real_r, CellStates.food, {food_value: Hyperparams.cost[cell.state.name]});
            }else{
                this.env.changeCell(real_c, real_r, CellStates.empty, null);
            }
        }
        this.species.decreasePop();
        this.living = false;
    }

    updateGrid() {
        for (var cell of this.anatomy.cells) {
            var real_c = this.c + cell.rotatedCol(this.rotation);
            var real_r = this.r + cell.rotatedRow(this.rotation);
            this.env.changeCell(real_c, real_r, cell.state, cell);
        }
    }

    update() {
        this.lifetime++;
        if (this.lifetime > this.lifespan()) {
            this.die();
            return this.living;
        }
        if (this.food_collected >= this.foodNeeded()) {
            this.reproduce();
        }
        for (var cell of this.anatomy.cells) {
            cell.performFunction();
            if (!this.living)
                return this.living
        }
        
        if (this.anatomy.is_mover) {
            this.move_count++;
            var changed_dir = false;
            if (this.ignore_brain_for == 0){
                changed_dir = this.brain.decide();
            }  
            else{
                this.ignore_brain_for --;
            }
            var moved = this.attemptMove();
            if ((this.move_count > this.move_range && !changed_dir) || !moved){
                var rotated = this.attemptRotate();
                if (!rotated) {
                    this.changeDirection(Directions.getRandomDirection());
                    if (changed_dir)
                        this.ignore_brain_for = this.move_range + 1;
                }
            }
        }

        return this.living;
    }

    getRealCell(local_cell, c=this.c, r=this.r, rotation=this.rotation){
        var real_c = c + local_cell.rotatedCol(rotation);
        var real_r = r + local_cell.rotatedRow(rotation);
        return this.env.grid_map.cellAt(real_c, real_r);
    }

}

module.exports = Organism;
