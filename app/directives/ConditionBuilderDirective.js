'use strict'

var _ = require('underscore');

angular
    .module('conditionBuilder', ['ngMaterial'])
    .directive('conditionBuilder', ConditionBuilderDirective)
    .controller('conditionController', ConditionController)


function ConditionBuilderDirective(){
    var q = '{"FILTER":{}}'
    return {
        restrict: 'E',
        scope: {
            query: '=query',
            attributes: '=attributes',
            q: '=q'
        },
        controller: ConditionController,
        controllerAs: "vm",
        bindToController: true,
        require: "conditionBuilder",
        templateUrl: './app/directives/ConditionBuilderDirective.html',
        link: function(scope, element, attrs, controller){
            
            let vm = controller;
            console.log("scope from directive")
            console.log(scope);
            
            scope.$watch('vm.rules', function(newValue){
                console.log("Watch")
                console.log(newValue);
                vm.createAPIQuery();
            })

        } // END OF link:
    } // END OF return
} // END OF ConditionBuilderDirective()

function ConditionController($scope){
    var vm = this;
    vm.scope = $scope;
    console.log("vm");
    console.log(vm.attributes);
    console.log("-- vm --");
    vm.OperatorByCondition       = {};
    vm.fields                    = []; // No purspose at this moment
    vm.rules                     = []; // used to store conditions
    vm.conditions                = {}; // Lists all conditions with labels and symbols
    vm.adminLabelCodeMap         = {}; // Maps admin_label with attribute code
    vm.adminLabelFieldTypeMap    = {}; // Maping field type to the admin_label. 
                                          // Admin_label is passed through ng-model of Condition section to getConditionsForFieldType()
    // Fill adminLabelFieldTypeMap and fields
    (function createAdminLabelFieldTypeMap(attributes){
        for (var i = 0; i < attributes.length; i++ ){
            var field = attributes[i]['admin_label'];
            vm.adminLabelFieldTypeMap[attributes[i]['admin_label']] = attributes[i]['field_type'];
            vm.fields.push(field);
            field = ""; // Reset variable
        };    
    })(vm.attributes);

    (function createAdminLabelCodeMap(attributes){
        for (var i = 0; i < attributes.length; i++){
            var adminLabel = attributes[i]['admin_label'];
            var code = attributes[i]['code'];
            vm.adminLabelCodeMap[adminLabel] = code;
        }
    })(vm.attributes);

    // all available condition
    vm.conditions            = {
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
    };

    // A map for query , maps API adjusted operator (value) by condition (key)
    vm.OperatorByCondition   = {
        "Equal": "e",
        "Not equal": "ne",
        "In": "in",
        "Not in": "nin",
        "Less then": "lt",
        "Less then or equal to": "lte",
        "Greater then": "gt",
        "Greater then or equal to": "gte",
        "Match": "m"
    };

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
    };
    
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
    };

    /*
     * Conflicting operations
    */
    const conflictingOperatorsMap = {};

    function htmlEntities(str){
        // Prevents for malicious inputs
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    /* 
     * If input value is date then format it to DD/MM/YYYY 
     * if not return value parsed through htmlEntities()  
    */
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
    };

    function getInitialCondition(admin_label){
        var fieldType = vm.adminLabelFieldTypeMap[admin_label];
        var fieldTypeAttributes = FieldTypeConditionMap[fieldType];
        return vm.conditions[fieldTypeAttributes[0]].label;
    };

    function getInitialInputType(admin_label){
        // Sets initial inputType when new condition is added
        var fieldType = vm.adminLabelFieldTypeMap[admin_label];
        return FieldTypeInputMap[fieldType];
    };

    /*
     * Creates API query in $watch
    */
    vm.createAPIQuery = function(){
        // @TODO Validate form (rules array) before creating a auery string
        // validateRules(vm.rules);
        vm.qry = "";
        var q = "filter";
        for(var i = 0; i < vm.rules.length; i++){
            var field = vm.adminLabelCodeMap[vm.rules[i].field];
            var condition = vm.OperatorByCondition[vm.rules[i].condition];
            var value = formatIfDate(vm.rules[i].value);
            q += "[fields." + field + "][" + condition + "]=" + value;
            if(i < vm.rules.length - 1){
                q += "&";
            }
        }
        // Validate length, create query if condition exists
        (q.length == 6) ? q = "" : q;
        return vm.qry = q;
    };

    vm.getConditionsForFieldType = function(admin_label){
        // accept admin_label tied to Field ng-model
        // Get filed type from the map
        var fieldType = vm.adminLabelFieldTypeMap[admin_label];
        // get the value property of the field type from FieldTypeConditionMap
        var fieldTypeAttributes = FieldTypeConditionMap[fieldType];
        // temp variable gets returned
        var temp = {};
        // Fill temp variable with conditions depanding on field_type
        for (var i = 0; i < fieldTypeAttributes.length; i++){
            // create an object to return
            temp[fieldTypeAttributes[i]] = vm.conditions[fieldTypeAttributes[i]];
        }
        return temp;
    };

    vm.setInputTypeForFieldType  = function(index, admin_label){
        // When Field select changes it call this function to set 
        // input type of the input field
        // @TODO See if this function can be combined with getConditionsForFieldType()
        var fieldType = vm.adminLabelFieldTypeMap[admin_label];
        vm.rules[index].inputType = FieldTypeInputMap[fieldType];
    };

    vm.addCondition              = function(){
        // ng-repeat of .group-condition is tied to vm.rules[]
        vm.rules.push({
            field: vm.attributes[0]['admin_label'],
            condition: getInitialCondition(vm.attributes[0]['admin_label']),
            value: "",
            inputType: getInitialInputType(vm.attributes[0]['admin_label']),
            isSearchable: true
        });
    };

    vm.removeCondition           = function(index){
        // Removes condition from array
        vm.rules.splice(index, 1);
    };

    function rulesValidation(rules){
        // console.log(rules);
        var fieldsArray = {};
        rules.forEach(function(rule, index){
            if(rule.value != ""){
                fieldsArray[rule.field] = index;
                console.log(index);                
            }
        })
        console.log(fieldsArray);
        // check for value fileds that are not empty
        // include those fields in the API query.
        // check for the same values 
    }

    $scope.$watch('', function(index){
        // watching for changes on paricular position in the rules array
    });

    $scope.$watch('vm.rules', function (newValue, oldValue, scope) {
        // console.log(newValue);
        // console.log(oldValue);
        // console.log(scope);
        /*
         * Validation 1
         * When a user changes field and current selected operator is not available
         * for that field set operator to be the first from available operators for newly selected field
        */        
        /*
         * Validation 2
         * If there are two text fields that contain operator IN and NIN and are set to equal
         * create one rule with input type text but with chips
        */
        /*
         * Validation 3 ???
         * Do not add condition to rules array if value is not entered ????
        */
        /*
         * Validation 4
         * Do not add conditions to rules that are contradictory (conflicting)
         * Example:
         * Product=Shoes&Product Match Cars
         * They must have the same field selected
         * Solution: Leave all, mark the last one isSearchable: true and others above isSearchable: false.
         *          Those that are not searchable gray out on the screen.
         *   _.map
         *  _.where
         *  _.countBy
        */

        // rulesValidation(vm.rules);
        // watch for changes in rules array and create query by calling createAPIQuery()
        // vm.createAPIQuery();

    }, true);
}

// ConditionController.prototype.print = function(text){
//     console.log(text);
// }

ConditionController.$inject = ['$scope'];
