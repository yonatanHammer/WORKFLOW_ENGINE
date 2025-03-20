

class WorkFlowEngine {
    constructor(steps) {
        this.steps = steps;
        this.steps_status = new Map();

    }

    async execute() {
        // Initialize  
        this.steps.forEach(step => this.steps_status.set(step.id, 'pending'));
        
        while (true) {
            const ready_queue = this.getReadySteps();
            
            // If no steps are left to run, exit
            if (ready_queue.length === 0) {
                
                var step_status_values = [...this.steps_status.values()];
                if (!step_status_values.some(status => status === 'pending' || status === 'running')) {
                    break;
                }
                console.log("\n[INFO] No available steps to execute. Possible deadlock or all remaining steps canceled.");
                break;
            }


            const steps_promises = ready_queue.map(async (current_step) => {
                this.steps_status.set(current_step.id, 'running');

                await current_step.run();

                if (current_step.status === 'completed') {
                    this.steps_status.set(current_step.id, 'completed');
                    // console.log(`[Step ${current_step.id}] - Completed successfully.`);
                }
                else {
                    this.steps_status.set(current_step.id, 'failed');
                    console.log(`[Step ${current_step.id}] - Failed.`);
                    this.cancelDependentSteps(current_step);
                }
            });

            await Promise.all(steps_promises);
        }

        this.printSummary();
    }


    /// RECURSIVE FUNCTION TO CANCEL ALL DEPENDENT AND SUBDEPENDENT STEPS
    cancelDependentSteps(failed_step) {
        var queue = [failed_step.id];

        while (queue.length > 0) {
            const current_step_id = queue.shift();

            for (let step of this.steps) {
                if (step.dependencies.includes(current_step_id) && this.steps_status.get(step.id) === 'pending') {
                    console.log(`[Cancel] - Dependent step ${step.id} is being canceled due to failure of Step ${failed_step.id}`);
                    this.steps_status.set(step.id, 'canceled');
                    queue.push(step.id);
                }
            }
        }
    }

    getReadySteps() {
        return this.steps.filter((step) => (
            this.steps_status.get(step.id) === 'pending' &&
            (step.dependencies.every(dep_id => this.steps_status.get(dep_id) === 'completed'))
        ));
    }




    // Print the execution summary
    printSummary() {
        console.log("\n****************************************************")
        console.log(`[SUMMARY] Final Workflow Status:`);
        console.log("-------------------------------")
        this.steps.forEach(step => {
            console.log(`[Step ${step.id}] - Status: ${this.steps_status.get(step.id)}`);
        })
        console.log("****************************************************")
    }
}

module.exports = WorkFlowEngine;