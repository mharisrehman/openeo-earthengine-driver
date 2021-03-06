const { JsonSchemaValidator } = require('@openeo/js-processgraphs');
const ajv = require('ajv');

module.exports = class GeeJsonSchemaValidator extends JsonSchemaValidator {

	constructor(context) {
		super();
		this.context = context;
	}

	async validateCollectionId(data) {
		if (this.context.getCollection(data) === null) {
			throw new ajv.ValidationError([{
				message: "Collection doesn't exist."
			}]);
		}
		return true;
	}
	
	async validateJobId() {
		var job = await this.context.getJob(data);
		if (job === null) {
			throw new ajv.ValidationError([{
				message: "Job doesn't exist."
			}]);
		}
		return true;
	}
	
	async validateOutputFormat(data) {
		if (!this.context.server().isValidOutputFormat(data)) {
			throw new ajv.ValidationError([{
				message: "Output format  '" + data + "' not supported."
			}]);
		}
		return true;
	}
	
	async validateInputFormat(data) {
		if (!this.context.server().isValidInputFormat(data)) {
			throw new ajv.ValidationError([{
				message: "Input format  '" + data + "' not supported."
			}]);
		}
		return true;
	}
	
	async validateProcessGraphId() {
		var pg = await this.context.getStoredProcessGraph(data);
		if (pg === null) {
			throw new ajv.ValidationError([{
				message: "Stored process graph doesn't exist."
			}]);
		}
		return true;
	}

}