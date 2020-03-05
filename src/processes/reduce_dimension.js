const { BaseProcess } = require('@openeo/js-processgraphs');
const Errors = require('../errors');
const ProcessGraph = require('../processgraph/processgraph');

module.exports = class reduce_dimension extends BaseProcess {

	async execute(node) {
		var dc = node.getDataCube("data");

		var dimensionName = node.getArgument("dimension");
		var dimension = dc.getDimension(dimensionName);
		if (dimension.type !== 'temporal' && dimension.type !== 'bands') {
			throw new Errors.ProcessArgumentInvalid({
				process: this.spec.id,
				argument: 'dimension',
				reason: 'Reducing dimension types other than `temporal` or `bands` is currently not supported.'
			});
		}

		var callback = node.getArgument("reducer");
		if (!(callback instanceof ProcessGraph)) {
			throw new Errors.ProcessArgumentInvalid({
				process: this.spec.id,
				argument: 'reducer',
				reason: 'No reducer specified.'
			});
		}
		else if (callback.getNodeCount() === 1) {
			// This is a simple reducer with just one node
			var process = callback.getProcess(callback.getResultNode());
			if (typeof process.geeReducer !== 'function') {
				throw new Errors.ProcessArgumentInvalid({
					process: this.spec.id,
					argument: 'reducer',
					reason: 'The specified reducer is invalid.'
				});
			}
			dc = this.reduceSimple(dc, process.geeReducer(node));
		}
		else {
			// This is a complex reducer
			var values;
			var ic = dc.imageCollection();
			if (dimension.type === 'temporal') {
				values = ic.toList(ic.size());
			}
			else if (dimension.type === 'bands') {
				values = dimension.getValues().map(band => ic.select(band));
			}
			var resultNode = await callback.execute({
				data: values,
				context: node.getArgument("context")
			});
			dc.setData(resultNode.getResult());

			// If we are reducing over bands we need to set the band name in GEE to a default one, e.g., "undefined"
			// ToDo: Make sure all other processes are aware of this, e.g. save_result
			if (dimension.type === 'bands') {
				dc.imageCollection(data => data.map(
					img => img.select(dc.imageCollection().first().bandNames()).rename(["undefined"])
				));
			}
		}

		// ToDo: We don't know at this point how the bands in the GEE images/imagecollections are called.
		dc.dropDimension(dimensionName);
		return dc;
	}

	reduceSimple(dc, reducerFunc, reducerName = null) {
		if (reducerName === null) {
			if (typeof reducerFunc === 'string') {
				reducerName = reducerFunc;
			}
			else {
				throw new Error("The parameter 'reducerName' must be specified.");
			}
		}

		if (!dc.isImageCollection() && !dc.isImage()) {
			throw new Error("Calculating " + reducerName + " not supported for given data type: " + dc.objectType());
		}
	
		dc.imageCollection(data => data.reduce(reducerFunc));

		// TODO: Not sure if necessary (in Use Case 1: the mean reducer didn't rename the bands...)
		// revert renaming of the bands following to the GEE convention
		var bands = dc.getBands();
		if (Array.isArray(bands) && bands.length > 0) {
			var renamedBands = bands.map(bandName => bandName + "_" + reducerName);
			dc.imageCollection(data => data.map(
				img => img.select(renamedBands).rename(bands)
			));
		}

		return dc;
	}

};