'use strict'
// require('./directives/QueryBuilderDirective.js');
require('./directives/ConditionBuilderDirective.js');
var attrSet             = require('./data/attribute_set.json');
const qs                = require('qs');
var attributes          = [];
var attributesControl   = [];

console.log(attrSet);
// Select attribute set that you want to include from API
var excludedFieldTypes = ['asset', 'relation', 'node', 'node_collection'];
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
// RESET temporary variables
attrSet             = {};
attributesControl   = [];

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

    $scope.json     = null;
    // simulira procesuiranje podataka dobijenih apijem
    $scope.filter   = JSON.parse(data);
    
    $scope.$watch('filter', function (newValue) {
        $scope.json     = JSON.stringify(newValue, null, 2);
        $scope.output   = computed(newValue.group);
    }, true);
    
};

QueryBuilderCtrl.$inject = ['$scope'];

// ------------
  
// const qs = require('qs');

// var q = {
//   "filter" : {
//     "fields.fname" : {
//       "e" : "velja"
//     },
//     "fields.lname" : {
//       "e" : "selja"
//     }
//   }
// };


// const qstring = qs.stringify(q, { encode: false });
// console.log(qstring);
