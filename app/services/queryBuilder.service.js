
let attrSet                 = require('../data/attribute_set_products.json');
let attributes              = [];   // Stores final result of attributes. Passed to directive.
let adminLabelFieldTypeMap  = {};
let adminLabelCodeMap       = {}
/*
* Helper variables
*/
let attributesControl   = [];   // Array used when parsing attribute set. Stores attribute ids and prevents from duplicates
let excludedFieldTypes = ['asset', 'relation', 'node', 'node_collection']; // Select attribute set that you want to exclude from API


(function extractAttributes(attrSet){
    for (var i = 0; i < attrSet.length; i++){
        var temp = {};
        for (var k = 0; k < attrSet[i].attributes.length; k++){
            if(!attributesControl.includes(attrSet[i].attributes[k].id) 
                    && !excludedFieldTypes.includes(attrSet[i].attributes[k]['field_type'])){
                attributesControl.push(attrSet[i].attributes[k].id);
                temp.id             = attrSet[i].attributes[k].id;
                temp.code           = attrSet[i].attributes[k].code;
                temp['admin_label'] = attrSet[i].attributes[k]['admin_label'];
                temp['field_type']  = attrSet[i].attributes[k]['field_type'];
                attributes.push(temp);
                temp = {};
            }
        }
    }
})(attrSet);
// RESET temporary variables
attrSet             = null;
attributesControl   = null;

(function createAdminLabelFieldTypeMap(attributes){
    for (let i = 0; i < attributes.length; i++ ){
        let field = attributes[i]['admin_label'];
        adminLabelFieldTypeMap[attributes[i]['admin_label']] = attributes[i]['field_type'];
        // vm.fields.push(field);
        field = ""; // Reset variable
    };    
})(attributes);

(function createAdminLabelCodeMap(attributes){
    for (let i = 0; i < attributes.length; i++){
        let adminLabel = attributes[i]['admin_label'];
        let code = attributes[i]['code'];
        adminLabelCodeMap[adminLabel] = code;
    }
})(attributes);

export default function queryBuilderService(queryBuilderConstants){
    let qbc = queryBuilderConstants;
    let self;
    return self = {
        qbcMessage:                 "This is queryBuilderService",
        wtf:                        function(str){console.log(str)},
        attributes:                 attributes,
        adminLabelFieldTypeMap:     adminLabelFieldTypeMap,
        adminLabelCodeMap:          adminLabelCodeMap,
        conditions:                 qbc.conditions,
        operatorByCondition:        qbc.operatorByCondition,
        fieldTypeConditionMap:      qbc.fieldTypeConditionMap,
        fieldTypeInputMap:          qbc.fieldTypeInputMap
    }
};
