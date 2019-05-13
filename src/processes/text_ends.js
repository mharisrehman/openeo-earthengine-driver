const Process = require('../processgraph/process');

module.exports = class text_ends extends Process {

    async execute(node, context) {
        var data = node.getArgument('data');
        var pattern = node.getArgument('pattern');
        var case_sensitive = node.getArgument('case_sensitive');
        if(!case_sensitive){
            data = data.toLowerCase();
            pattern = pattern.toLowerCase();
        }

        return data.endsWith(pattern);
    }

};