

class Step {
    constructor(id, type, dependencies=[], logic, retry_limit=0) {
        this.id = id, 
        this.type = type, // 'email' || 'update_grant'
        this.status = 'pending', // 'pending' || 'running' || 'completed' || 'failed' || 'canceled'
        this.dependencies = dependencies, // array of step IDs
        this.logic = logic // Function to execute

        this.retry_limit = retry_limit
        this.retry_count = 0

    }

    async run() {
        try {
            console.log(`\n[Running step ${this.id}] (${this.type}):`);

            this.status = 'running'
            await this.logic()
            this.status = 'completed'

        } catch (error) {
            console.error(`[Step ${this.id}] - Error: ${error.message}`);

            this.retry_count += 1
            if (this.retry_count <= this.retry_limit) {
                console.log(`[Retrying Step ${this.id}] (${this.retry_count}/${this.retry_limit})`);
                return this.run()
            }
            
            this.status = 'failed'

        }
        return this
    }
}

module.exports = Step;