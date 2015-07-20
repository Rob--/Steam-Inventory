require('angular');

var app = angular.module('inventoryLoader', ['ngAnimate']);

app.controller('inventoryCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.items = [];
    $scope.columnSize = 2;
    $scope.loading = false;
    $scope.error = false;

    $scope.loadInventory = function(){
        $scope.loading = true;
        console.log($scope.username)
        console.log(username)
        $http.jsonp("http://2.120.163.83:8080/api/v1/getInventory?sid=" + encodeURIComponent($scope.username) + "&callback=JSON_CALLBACK")
        .success(function(data){
            $scope.loading = false;
            $scope.items = data;
            console.log("Successfully feteched inventory for " + $scope.username);
        }).error(function(){
            $scope.loading = false;
            $scope.error = true;
            console.log("Error fetching inventory.")
        });
    }
}]);
