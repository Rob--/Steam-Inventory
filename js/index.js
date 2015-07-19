require('angular');

var app = angular.module('inventoryLoader', []);

app.controller('inventoryCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.items = [];

    $scope.loadInventory = function(){
        $http.jsonp("http://2.120.163.83:8080/api/v1/getInventory?sid=" + encodeURIComponent($scope.username) + "&callback=JSON_CALLBACK")
        .success(function(data){
            $scope.items = data;
            console.log(data)
        }).error(function(){
            console.log("error")
        });
    }
}]);
