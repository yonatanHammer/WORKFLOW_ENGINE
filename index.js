const fs = require('fs');
const path = require('path');
const Step = require('./src/step');
const WorkFlowEngine = require('./src/engine');


async function loadSteps(file_path) {
    const steps_data = JSON.parse(fs.readFileSync(file_path));

    return steps_data.map((step) => (
        new Step(step.id, step.type, step.dependencies, eval(step.logic), step.retry_limit)
    ))
}

async function main() {
    const file_path = path.join(__dirname, 'steps.json');
    const steps = await loadSteps(file_path);

    const engine = new WorkFlowEngine(steps);
    await engine.execute();

    console.log("\nEnd main")

}

main()