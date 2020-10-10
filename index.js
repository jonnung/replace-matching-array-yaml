const core = require('@actions/core');
const yaml = require('js-yaml');

const sourceFile = core.getInput('source-file');
const targetFile = core.getInput('target-file');
const matchingKey = core.getInput('matching-key');

const fs = require('fs');     
fs.readFile(sourceFile, 'utf8', (error, data) => {
    try {
        if (error) {
            throw new Error(error.message);
        } else {
            core.info(`Read source file "${sourceFile}"`);
            const sourceData = JSON.parse(data);
            if (sourceData.hasOwnProperty(matchingKey)) {
                core.info(`Found matching key in the source file -> "${matchingKey}"`);

                var targetData = yaml.load(fs.readFileSync(targetFile, 'utf8'));
                if (Array.isArray(targetData)) {
                    core.info('Target data is Array type');

                    for (var i in targetData) {
                        if (targetData[i][matchingKey] !== undefined && targetData[i][matchingKey] === sourceData[matchingKey]) {
                            for (var keyName in sourceData) {
                                if (keyName === matchingKey) {
                                    continue;
                                }
                                if (keyName in targetData[i]) {
                                    targetData[i][keyName] = sourceData[keyName];
                                    core.debug(`Replace #${i}:${targetData[i][keyName]} -> ${sourceData[keyName]}`); 
                                }
                            }
                            break;
                        }
                    }
                    fs.writeFileSync(targetFile, yaml.dump(targetData));
                    core.info('Rewrited target file');
                } else if (typeof targetData == 'object' && targetData instanceof Object) {
                    core.info('Target data is Object type');
                    // TO DO
                } else {
                    throw new Error('Ivalid data type');
                }
            } else {
                throw new Error('Not found matching key in the source data');
            }
        }
    } catch (error) {
        core.setFailed(error.message);
    }
});

