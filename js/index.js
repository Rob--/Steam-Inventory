require('angular');

var app = angular.module('inventoryLoader', ['ngAnimate']);

app.controller('inventoryCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.items = [];
    $scope.columnSize = 1;
    $scope.loading = false;
    $scope.error = false;
    $scope.total = 0;

    $scope.loadInventory = function(){
        $scope.loading = true;
        $scope.error = false;
        $scope.items = [];
        $scope.total = 0;
        $http.jsonp("http://2.120.163.83:8080/api/v1/getInventory?username=" + encodeURIComponent($scope.username) + "&callback=JSON_CALLBACK")
        .success(function(data){
            if(data.success){
                $scope.items = data.items;
                $scope.total = data.total;
                console.log("Successfully fetched inventory for " + $scope.username);
            } else {
                $scope.error = true;
                console.log("Error fetching inventory, reason: " + data.reason);
            }
            $scope.loading = false;
        }).error(function(){
            $scope.loading = false;
            $scope.error = true;
            console.log("Error fetching inventory.")
        });
    }
}]);
