"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExtension = ApiExtension;
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
const lodash_1 = require("lodash");
function ApiExtension(extensionKey, extensionProperties) {
    if (!extensionKey.startsWith('x-')) {
        throw new Error('Extension key is not prefixed. Please ensure you prefix it with `x-`.');
    }
    const extensionObject = {
        [extensionKey]: (0, lodash_1.clone)(extensionProperties)
    };
    return (0, helpers_1.createMixedDecorator)(constants_1.DECORATORS.API_EXTENSION, extensionObject);
}
