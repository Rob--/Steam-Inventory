require('angular');

var app = angular.module('inventoryLoader', ['ngFx']);

app.controller('inventoryCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.items = [];
    $scope.columnSize = 2;
    $scope.loading = false;

    $scope.loadInventory = function(){
        $scope.loading = true;
        $http.jsonp("http://2.120.163.83:8080/api/v1/getInventory?sid=" + encodeURIComponent($scope.username) + "&callback=JSON_CALLBACK")
        .success(function(data){
            $scope.loading = false;
            $scope.items = data;
            console.log("Successfully fteched inventory for " + $scope.username);
        }).error(function(){
            console.log("Error fetching inventory.")
        });
    }
}]);
