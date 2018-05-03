angular
  .module('MyApp',['ngMaterial', 'ngSanitize', 'queryBuilder'])
  .controller('AppCtrl', function($scope) {
    var ctrl = this;
  
    ctrl.field = "name";
    ctrl.comparator = "e";
  })
  .controller('QueryItemController', QueryItemController)
  .controller('QueryBuilderCtrl', QueryBuilderCtrl);


function QueryItemController($scope) {
  var ctrl = this;
  
  ctrl.$scope = $scope;
  
  ctrl.property = null;
  ctrl.comparator = null;
  ctrl.value = null;
  
  ctrl.comparators = [];
  
};

QueryItemController.prototype.getQueryPart = function() {
  var ctrl = this;
  
  console.log('property', ctrl.property);
  console.log('comparator', ctrl.comparator);
  console.log('value', ctrl.value);
};

QueryItemController.$inject = ['$scope'];
  
function QueryBuilderCtrl($scope) {
    var data = '{"group": {"operator": "AND","rules": []}}';

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

    $scope.json = null;

    $scope.filter = JSON.parse(data);

    $scope.$watch('filter', function (newValue) {
        //console.log(newValue);
        $scope.json = JSON.stringify(newValue, null, 2);
        //console.log(newValue.group);
        $scope.output = computed(newValue.group);
    }, true);
};

QueryBuilderCtrl.$inject = ['$scope'];

// ------------
  




