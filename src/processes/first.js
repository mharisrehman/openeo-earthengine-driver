const { BaseProcess } = require('@openeo/js-processgraphs');

module.exports = class first extends BaseProcess {

	geeReducer(node) {
		return node.getArgument('ignore_nodata', true) ? 'firstNonNull' : 'first';
	}

	async execute(node) {
		throw "Not implemented yet.";
	}

};