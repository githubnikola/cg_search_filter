'use strict'
var _       = require('underscore');
const qs    = require('qs');

angular
    .module('conditionBuilder', ['ngMaterial'])
    .directive('conditionBuilder', ConditionBuilderDirective);

function ConditionBuilderDirective(){
    var q = '{"FILTER":{}}'
    return {
        restrict: 'E',
        scope: {
            query: '=query',
            attributes: '=attributes',
            q: '=q'
        },
        templateUrl: './app/directives/ConditionBuilderDirective.html',
        link: function(scope, element, attrs){

            scope.fields                    = []; // No purspose at this moment
            scope.rules                     = []; // used to store conditions
            scope.conditions                = {}; // Lists all conditions with labels and symbols
            scope.adminLabelCodeMap         = {}; // Maps admin_label with attribute code
            scope.adminLabelFieldTypeMap    = {}; // Maping field type to the admin_label. 
                                                  // Admin_label is passed through ng-model of Condition section to getConditionsForFieldType()
            
            // Fill adminLabelFieldTypeMap and fields
            for (var i = 0; i < scope.attributes.length; i++ ){
                var field = scope.attributes[i]['admin_label'];
                scope.adminLabelFieldTypeMap[scope.attributes[i]['admin_label']] = scope.attributes[i]['field_type'];
                scope.fields.push(field);
                field = ""; // Reset variable
            }

            // all available condition
            scope.conditions            = {
                "e": {
                    label: "Equal",
                    symbol: "="
                },
                "ne": {
                    label: "Not equal",
                    symbol: "<>"
                },
                "in": {
                    label: "In",
                    symbol: ""
                },
                "nin": {
                    label: "Not in",
                    symbol: ""
                },
                "lt": {
                    label: "Less than",
                    symbol: "<"
                },
                "lte": {
                    label: "Less than or equal to",
                    symbol: "<="
                },
                "gt": {
                    label: "Greater than",
                    symbol: ">"
                },
                "gte": {
                    label: "Greater then or equal to",
                    symbol: ">="
                },
                "m": {
                    label: "Match",
                    symbol: "%"
                }
            }

            // A map for query , maps API adjusted operator (value) by condition (key)
            const OperatorByCondition   = {
                "Equal": "e",
                "Not equal": "ne",
                "In": "in",
                "Not in": "nin",
                "Less then": "lt",
                "Less then or equal to": "lte",
                "Greater then": "gt",
                "Greater then or equal to": "gte",
                "Match": "m"
            }

            // A map of field_type and conditions available to it
            const FieldTypeConditionMap = {
                "text": ['e', 'ne', 'in', 'nin', /*'lt', 'lte', 'gt', 'gte',*/ 'm'],
                "tags": ['e', 'ne', 'in', 'nin', /*'lt', 'lte', 'gt', 'gte',*/ 'm'],
                "integer": ['e', 'ne', 'in', 'nin', 'lt', 'lte', 'gt', 'gte', /*'m'*/],
                "decimal": ['e', 'ne', 'in', 'nin', 'lt', 'lte', 'gt', 'gte', /*'m'*/],
                "datetime": ['e', 'ne', 'in', 'nin', 'lt', 'lte', 'gt', 'gte', /*'m'*/],
                "boolean": ['e', 'ne', 'in', 'nin', /*'lt', 'lte', 'gt', 'gte', 'm'*/],
                "select": ['e', 'ne', 'in', 'nin', 'lt', 'lte', 'gt', 'gte', 'm'],
                "multiselect": ['e', 'ne', 'in', 'nin', 'lt', 'lte', 'gt', 'gte', 'm']
            }

            // Maps attribute field_type with appropriate html input type
            const FieldTypeInputMap     = {
                "text": "text",
                "tags": "text",
                "integer": "number",
                "decimal": "number",
                "datetime": "date",
                "boolean": "text",
                "select": "text",
                "multiselect": "text"            
            }

            function htmlEntities(str){
                // Prevents for malicious inputs
                return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }

            function formatIfDate(value){
                if(value instanceof Date){
                    var day     = value.getDate(); 
                    var month   = value.getMonth()+1;
                    var year    = value.getFullYear();
                    if(day <= 9){ day = "0" + day };
                    if(month <= 9){ month = "0" + month }
                    return day + "/" + month + "/" + year;
                }
                else {
                    return htmlEntities(value)
                }
            }

            function getInitialCondition(admin_label){
                var fieldType = scope.adminLabelFieldTypeMap[admin_label];
                var fieldTypeAttributes = FieldTypeConditionMap[fieldType];
                return scope.conditions[fieldTypeAttributes[0]].label;
            }

            function getInitialInputType(admin_label){
                // Sets initial inputType when new condition is added
                var fieldType = scope.adminLabelFieldTypeMap[admin_label];
                return FieldTypeInputMap[fieldType];
            }

            (function createAdminLabelCodeMap(attributes){
                for (var i = 0; i < attributes.length; i++){
                    var adminLabel = attributes[i]['admin_label'];
                    var code = attributes[i]['code'];
                    scope.adminLabelCodeMap[adminLabel] = code;
                }
            })(scope.attributes);

            scope.getConditionsForFieldType = function(admin_label){
                // accept admin_label tied to Field ng-model
                // Get filed type from the map
                var fieldType = scope.adminLabelFieldTypeMap[admin_label];
                // get the value property of the field type from FieldTypeConditionMap
                var fieldTypeAttributes = FieldTypeConditionMap[fieldType];
                // temp variable gets returned
                var temp = {};
                // Fille temp variable with conditions depanding on field_type
                for (var i = 0; i < fieldTypeAttributes.length; i++){
                    // create an object to return
                    temp[fieldTypeAttributes[i]] = scope.conditions[fieldTypeAttributes[i]];
                }
                return temp;
            }

            scope.setInputTypeForFieldType  = function(index, admin_label){
                // When Field select changes it call this function to set 
                // input type of the input field
                // @TODO See if this function can be combined with getConditionsForFieldType()
                console.log(admin_label);
                var fieldType = scope.adminLabelFieldTypeMap[admin_label];
                scope.rules[index].inputType = FieldTypeInputMap[fieldType];
            }

            scope.addCondition              = function(){
                // ng-repeat of .group-condition is tied to scope.rules[]
                scope.rules.push({
                    field: scope.attributes[0]['admin_label'],
                    condition: getInitialCondition(scope.attributes[0]['admin_label']),
                    value: "",
                    inputType: getInitialInputType(scope.attributes[0]['admin_label'])
                });
            }

            scope.removeCondition           = function(index){
                // Removes condition from array
                scope.rules.splice(index, 1);
            };

            scope.$watch('rules', function (newValue) {
                // watch for changes in rules array and create query
                // @TODO if you add to conditions, only one will be added, must do it as a string
                scope.qry = "";
                var q = "filter";
                for(var i = 0; i < scope.rules.length; i++){
                    var field = scope.adminLabelCodeMap[scope.rules[i].field];
                    var condition = OperatorByCondition[scope.rules[i].condition];
                    var value = formatIfDate(scope.rules[i].value);
                    q += "[fields." + field + "][" + condition + "]=" + value;
                    if(i < scope.rules.length - 1){
                        q += "&";
                    }
                }
                // Validate length, create query if condition exists
                (q.length == 6) ? q = "" : q;
                return scope.qry = q;
            }, true);

        } // END OF link:
    } // END OF return
} // END OF ConditionBuilderDirective()


