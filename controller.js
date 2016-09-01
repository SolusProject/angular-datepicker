var myApp = angular.module('myApp', ['datepicker'])
.controller('ctrl', ["$scope", function(scope) {


    scope.firstName= "John";
    scope.lastName= "Doe";

    scope.d = new Date();


}]);
