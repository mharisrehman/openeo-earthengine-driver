const { BaseProcess } = require('@openeo/js-processgraphs');
const Commons = require('../processgraph/commons');

module.exports = class absolute extends BaseProcess {

    async execute(node) {
        return Commons.applyInCallback(node, image => image.abs(), x => Math.abs(x));
    }

};