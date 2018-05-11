'use strict'
// require('./directives/QueryBuilderDirective.js');
require('./directives/ConditionBuilderDirective.js');
var attrSet             = require('./data/attribute_set_products.json');
const qs                = require('qs');
var attributes          = [];   // Stores final result of attributes. Passed to directive.
var attributesControl   = [];   // Array used when parsing attribute set. Stores attribute ids and prevents from duplicates

// Select attribute set that you want to exclude from API
var excludedFieldTypes = ['asset', 'relation', 'node', 'node_collection'];

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

// ================================================================
angular
    .module('QueryBuilder',['ngMaterial', 'ngSanitize', 'conditionBuilder'])
    .controller('QueryBuilderCtrl', QueryBuilderCtrl);

function QueryBuilderCtrl($scope) {
    // data simulira api
    var data            = '{"group": {"operator": "AND","rules": []}}';
    var query           = "OVO JE KVERI";

    $scope.attributes   = attributes;
    $scope.query        = query;
    $scope.json         = null;
    // simulira procesuiranje podataka dobijenih apijem
    $scope.filter   = JSON.parse(data);

    function htmlEntities(str) {
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function computed(group) {
        if (!group) return "";
        for (var str = "(", i = 0; i < group.rules.length; i++) {
            i > 0 && (str += " <strong>" + group.operator + "</strong> ");
            str += group.rules[i].group ?
                computed(group.rules[i].group) :
                group.rules[i].field + " " + htmlEntities(group.rules[i].condition) + " " + group.rules[i].data;
        }
        return str + ")";
    }

    $scope.$watch('filter', function (newValue) {
        $scope.json     = JSON.stringify(newValue, null, 2);
        $scope.output   = computed(newValue.group);
    }, true);
};

QueryBuilderCtrl.$inject = ['$scope'];
