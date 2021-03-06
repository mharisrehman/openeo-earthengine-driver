const axios = require('axios');
const Errors = require('./errors');
const fse = require('fs-extra');

var HttpUtils = {

	isFile(path) {
		return fse.stat(path).then(stat => {
			if (stat.isFile()) {
				return Promise.resolve();
			}
			else {
				return Promise.reject(new Errors.FileOperationUnsupported());
			}
		})
		.catch(err => {
			return Promise.reject(new Errors.FileNotFound());
		});
	},

	stream(opts) {
		return axios(opts).catch(error => {
			if (opts.responseType === 'stream' && error.response !== null && typeof error.response === 'object' && error.response.data !== null) {
				// JSON error responses are Blobs and streams if responseType is set as such, so convert to JSON if required.
				// See: https://github.com/axios/axios/issues/815
				return new Promise((_, reject) => {
					var chunks = [];
					error.response.data.on("data", chunk => chunks.push(chunk));
					error.response.data.on("error", () => reject(error));
					error.response.data.on("end", () => reject(new Errors.EarthEngineError({
						message: Buffer.concat(chunks).toString(),
						process: 'save_result'
					})));
				});
			}
			throw error;
		});

	},
};

module.exports = HttpUtils;
	