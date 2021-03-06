const { BaseProcess } = require('@openeo/js-processgraphs');
const Commons = require('../processgraph/commons');

module.exports = class floor extends BaseProcess {

    async execute(node) {
        return Commons.applyInCallback(node, image => image.floor(), x => Math.floor(x));
    }

};