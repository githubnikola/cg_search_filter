'use strict'
angular
  .module('queryBuilder', ['ngMaterial'])
  .directive('queryBuilder', QueryBuilderDirective);

function QueryBuilderDirective($compile) {
  return {
    restrict: 'E',
    scope: {
      group: '='
    },
    templateUrl: './app/directives/queryBuilderDirective.html',
    compile: function (element, attrs) {
        console.log(attrs);
          var content, 
              directive;
          
          content = element.contents().remove();
          
          return function (scope, element, attrs) {
            scope.operators = [
              { name: 'AND' },
              { name: 'OR' }
            ];

            scope.fields = [
              { name: 'Firstname' },
              { name: 'Lastname' },
              { name: 'Birthdate' },
              { name: 'City' },
              { name: 'Country' }
            ];

            scope.conditions = [
              { name: '=' },
              { name: '<>' },
              { name: '<' },
              { name: '<=' },
              { name: '>' },
              { name: '>=' },
              { name: 'Begins with' },
              { name: 'Contains'}
            ];

            scope.addCondition = function () {
              scope.group.rules.push({
                condition: '=',
                field: 'Firstname',
                data: ''
              });
            };

            scope.removeCondition = function (index) {
              scope.group.rules.splice(index, 1);
            };

            directive || (directive = $compile(content));

            element.append(directive(scope, function ($compile) {
              return $compile;
            }));
          }
    }
  }
};

QueryBuilderDirective.$inject = ['$compile'];
