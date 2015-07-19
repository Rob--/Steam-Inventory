require('angular');
var request = require('request');

function evaluateUsername(username){
    getInventory(username);
}

function getInventory(suffix){
    console.log("..")
/*    request('http://2.120.163.83:8080/api/v1/getInventory', function (error, response, body) {
        console.log(".")
        console.log(body)
        console.log(error)
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    });*/

}

var app = angular.module('inventoryLoader', []);

app.controller('inventoryCtrl', function($scope) {
    $scope.loadInventory = function(){
        evaluateUsername($scope.username);
        $http({method: "JSONP", url: "http://2.120.163.83:8080/api/v1/getInventory"}).success(function(data, status) {
            console.log(data)
            console.log(status)
        }).error(function(data, status) {
            console.log(data)
            console.log(status)
        });
    }
});
