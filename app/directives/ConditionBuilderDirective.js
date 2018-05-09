'use strict'
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
            scope.adminLabelFieldTypeMap    = {}; // Maping field type to the admin_label. 
                                                  // Admin_label is passed through ng-model of Condition section to getConditionsForFieldType()
            // Fill adminLabelFieldTypeMap and fields
            for (var i = 0; i < scope.attributes.length; i++ ){
                var field = scope.attributes[i]['admin_label'];
                scope.adminLabelFieldTypeMap[scope.attributes[i]['admin_label']] = scope.attributes[i]['field_type'];
                scope.fields.push(field);
                field = ""; // Reset variable
            }

            // all possible condition
            scope.conditions = {
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

            // A map of field_type and condition available to it
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

            const FieldTypeInputMap = {
                "text": "text",
                "tags": "text",
                "integer": "number",
                "decimal": "number",
                "datetime": "date",
                "boolean": "text",
                "select": "text",
                "multiselect": "text"            
            }

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

            scope.setFieldTypeInputType = function(index, admin_label){
                console.log(admin_label)
                var fieldType = scope.adminLabelFieldTypeMap[admin_label];
                scope.rules[index].inputType = FieldTypeInputMap[fieldType];
                // console.log(fieldType + " " + index);
                // console.log(scope.rules[index].inputType)
            }
            // var ats = getConditionsForFieldType('Content');
            // console.log(ats);

            scope.addCondition = function(){
                scope.rules.push({
                    field: scope.attributes[0]['admin_label'],
                    condition: "",
                    value: "",
                    inputType: "text"
                });
            }

            scope.removeCondition = function (index) {
                scope.rules.splice(index, 1);
            };

            scope.$watch('rules', function (newValue) {
                // find "code" in attributes by newValue (['admin_label'])
                // return set of condition for chosen field name
                scope.query = newValue;
            }, true);

        } // END OF link:
    } // END OF return
} // END OF ConditionBuilderDirective()


