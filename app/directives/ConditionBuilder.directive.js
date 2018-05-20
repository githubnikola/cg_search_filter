"use strict"
import QueryBuilderService from "../services/queryBuilder.service.js";
import QueryBuilderConstant from "../services/queryBuilder.constant.js";
var _ = require('underscore');

angular
    .module('conditionBuilder', ['ngMaterial'])
    .constant('queryBuilderConstant', QueryBuilderConstant)
    .factory('queryBuilderService', QueryBuilderService)
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
        templateUrl: './app/directives/ConditionBuilderDirective.tmpl.html',
        link: function(scope, element, attrs, controller){
            
            let vm = controller;
            console.log("cbd: ", scope);
            
            scope.$watch('vm.rules', function(newValue){
                console.log("Watch:", newValue);
                vm.createAPIQuery();
            })
        } // END OF link:
    } // END OF return
}; // END OF ConditionBuilderDirective()

function ConditionController($scope, queryBuilderService){
    const vm = this;
    const qbs = queryBuilderService;
    vm.scope = $scope;
    console.log("Ovo je servis qbs: " , qbs);

    vm.fields                    = []; // No purspose at this moment
    vm.rules                     = []; // used to store conditions
    vm.attributes                = qbs.attributes;
    vm.OperatorByCondition       = qbs.operatorByCondition;
    vm.conditions                = qbs.conditions; // Lists all conditions with labels and symbols
    vm.FieldTypeConditionMap     = qbs.fieldTypeConditionMap;
    vm.adminLabelCodeMap         = {}; // Maps admin_label with attribute code used in createAPIQuery()
    vm.FieldTypeInputMap         = qbs.fieldTypeInputMap;
    vm.adminLabelFieldTypeMap    = qbs.adminLabelFieldTypeMap; // Maping field type to the admin_label.
                                          // Admin_label is passed through ng-model of Condition section to getConditionsForFieldType()
    vm.conflictingOperatorsMap = {};
    
    vm.rulesValidation = function(rules){
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

    vm.mergeRulesIfContainTheSameValue = function(rules){
        //how many fields have the same field selected 
        var u = _.map(rules, function(value, key){
            console.log(value);
            console.log(key);
        });
    }

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
         * If there are two same text fields that contain operator equal or not equal,   
         * create one rule with input type text but with chips and operator IN or NIN
        */
        //mergeRulesIfContainTheSameValue(vm.rules);
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
         * use operatorsCondtradictionMap variable
         * Solution: Leave all, mark the last one isSearchable: true and others above isSearchable: false.
         *          Those that are not searchable gray out on the screen.
         *   _.map
         *  _.where
         *  _.countBy
        */

        // rulesValidation(vm.rules);
        // watch for changes in rules array and create query by calling createAPIQuery()
        vm.createAPIQuery();
    }, true);
};

ConditionController.prototype.addCondition = function(){
    const vm = this;
     // ng-repeat of .group-condition is tied to vm.rules[]
        vm.rules.push({
            field: vm.attributes[0]['admin_label'],
            condition: vm.getInitialCondition(vm.attributes[0]['admin_label']),
            value: "",
            inputType: vm.getInitialInputType(vm.attributes[0]['admin_label']),
            isSearchable: true
        });
};

ConditionController.prototype.removeCondition = function(index){
    const vm = this;
    // Removes condition from array
    vm.rules.splice(index, 1);
};

ConditionController.prototype.htmlEntities = function(str){
    const vm = this;
    // Prevents for malicious inputs
    return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

ConditionController.prototype.formatIfDate = function(value){
    const vm = this;
    if(value instanceof Date){
        var day     = value.getDate(); 
        var month   = value.getMonth()+1;
        var year    = value.getFullYear();
        if(day <= 9){ day = "0" + day };
        if(month <= 9){ month = "0" + month };
        return day + "/" + month + "/" + year;
    }
    else {
        return vm.htmlEntities(value)
    } 
};

ConditionController.prototype.formatInputField = function(index, condition){
    const vm = this;
    if(condition == "In" || condition == "Not in"){
        vm.rules[index].inputType = vm.rules[index].inputType + "-array";
        if(vm.rules[index].value.length > 1){
            let valueIntoArray = vm.rules[index].value
            vm.rules[index].value = [];
            vm.rules[index].value.push(valueIntoArray);
        } else {
            vm.rules[index].value = [];
        }

        console.log(index);
        console.log(condition);
        console.log(vm.rules[index]);
    }
    else {
        vm.setInputTypeForFieldType(index, vm.rules[index].field);
        if(vm.rules[index].value.length > 0){
            let firstValueInArray = vm.rules[index].value[0];
            vm.rules[index].value = firstValueInArray;
        } else {
            vm.rules[index].value = "";
        }
        console.log(index);
        console.log(condition);
        console.log(vm.rules[index]);
    }
};

ConditionController.prototype.getInitialCondition = function(admin_label){
        const vm = this;
        let fieldType = vm.adminLabelFieldTypeMap[admin_label];
        let fieldTypeAttributes = vm.FieldTypeConditionMap[fieldType];
        return vm.conditions[fieldTypeAttributes[0]].label;
};

ConditionController.prototype.getInitialInputType = function(admin_label){
    // Called inside addCondition method
    const vm = this;
    // Sets initial inputType when new condition is added
    let fieldType = vm.adminLabelFieldTypeMap[admin_label];
    return vm.FieldTypeInputMap[fieldType];
};

ConditionController.prototype.getConditionsForFieldType = function(admin_label){
    const vm = this;
    // accept admin_label tied to Field ng-model
    // Get filed type from the map
    let fieldType = vm.adminLabelFieldTypeMap[admin_label];
    // get the value property of the field type from FieldTypeConditionMap
    let fieldTypeAttributes = vm.FieldTypeConditionMap[fieldType];
    // temp variable gets returned
    let temp = {};
    // Fill temp variable with conditions depanding on field_type
    for (let i = 0; i < fieldTypeAttributes.length; i++){
        // create an object to return
        temp[fieldTypeAttributes[i]] = vm.conditions[fieldTypeAttributes[i]];
    }
    return temp;
};

ConditionController.prototype.setInputTypeForFieldType = function(index, admin_label){
    const vm = this;
    // When Field select changes it call this function to set 
    // input type of the input field
    // @TODO See if this function can be combined with getConditionsForFieldType()
    let fieldType = vm.adminLabelFieldTypeMap[admin_label];
    vm.rules[index].inputType = vm.FieldTypeInputMap[fieldType];
};

ConditionController.prototype.createAPIQuery = function(){
    const vm = this;
    // @TODO Validate form (rules array) before creating a auery string
    // validateRules(vm.rules);
    //console.log(JSON.stringify(vm.rules));
    vm.rulesState(vm.rules);
    if(vm.rules.length>0){
        vm.qry = "";
        let q = "filter";
        for(let i = 0; i < vm.rules.length; i++){
            let field = vm.adminLabelCodeMap[vm.rules[i].field];
            let condition = vm.OperatorByCondition[vm.rules[i].condition];
            let value = vm.formatIfDate(vm.rules[i].value);
            // If rule value is an array format the query and the otherway around
            if(vm.rules[i].value instanceof Array){
                q += "[fields." + field + "][" + condition + "]=[" + value + "]"    
            } else {
                q += "[fields." + field + "][" + condition + "]=" + value;
            }
            
            if(i < vm.rules.length - 1){
                q += "&";
            }
        }
        // Validate length, create query if condition exists
        return vm.query = q;            
    } else {
        return vm.query = "";
    }
};

ConditionController.prototype.rulesState = function(rules){
    //Ako je field ProductName i condition je Equal,
    //i ima ih dva oznaci isSearchable kao false
    // var res = _.find(rules, function(ret){return ret.field === "Product name"});
    var res = _.pluck(rules, 'field')
    console.log("Ovo je rulesState: ", res);
};

ConditionController.$inject = ['$scope', 'queryBuilderService'];
QueryBuilderService.$inject = ['queryBuilderConstant'];
