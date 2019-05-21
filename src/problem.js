/**
 * Represents a variation of a problem
 */
class Problem { 
	constructor(uniqueId, problemId, timestamp, tags, inWorksheets, body) {
		this.uniqueId = uniqueId;
		this.problemId = problemId;
		this.timestamp = timestamp;
		this.tags = tags;
		this.inWorksheets = inWorksheets;
		this.body = body;
	}

	/**
	 * Return: this.uniqueId
	 */
	toString() {
		return this.uniqueId;
	}
}
