require('angular');

var app = angular.module('inventoryLoader', ['ngAnimate']);

app.controller('inventoryCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.items = [];
    $scope.columnSize = 2;
    $scope.loading = false;
    $scope.error = false;

    $scope.loadInventory = function(){
        $scope.loading = true;
        $scope.items = [];
        $http.jsonp("http://2.120.163.83:8080/api/v1/getInventory?username=" + encodeURIComponent($scope.username) + "&callback=JSON_CALLBACK")
        .success(function(data){
            if(data.success){
                $scope.error = true;
                console.log("Error fetching inventory, reason: " + data.reason);
            } else {
                $scope.items = data.items;
                console.log("Successfully fetched inventory for " + $scope.username);
            }
            $scope.loading = false;
        }).error(function(){
            $scope.loading = false;
            $scope.error = true;
            console.log("Error fetching inventory.")
        });
    }
}]);
