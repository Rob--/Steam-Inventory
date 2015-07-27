require('angular');

var app = angular.module('inventoryLoader', []);

app.controller('inventoryCtrl', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
    $scope.currencies = [
        ['USD', '&dollar;'],
        ['GBP', '&pound;'],
        ['EUR', '&euro;'],
        ['AUD', '&dollar;'],
        ['BGN', '&#1083;'],
        ['BRL', 'R&dollar;'],
        ['CAD', '&dollar;'],
        ['CHF', 'CHF'],
        ['CNY', '&#165;'],
        ['CZK', 'K&#269;'],
        ['DKK', 'kr'],
        ['HKD', '&dollar;'],
        ['HRK', 'kn'],
        ['HUF', 'Ft'],
        ['IDR', 'Rp'],
        ['ILS', '&#8362;'],
        ['INR', '&#8377;'],
        ['JPY', '&#165;'],
        ['KRW', '&#8361;'],
        ['MXN', '&dollar;'],
        ['MYR', 'RM'],
        ['NOK', 'kr'],
        ['NZD', '&dollar;'],
        ['PHP', '&#8369;'],
        ['PLN', 'z&#322;'],
        ['RON', 'lei'],
        ['RUB', 'ру&#1073;'],
        ['SEK', 'kr'],
        ['SGD', '&dollar;'],
        ['THB', '&#3647;'],
        ['TRY', '&#8378;'],
        ['ZAR', 'R']
    ];

    $scope.data = {items: [], total: 0}
    $scope.columnSize = 1;
    $scope.loading = false;
    $scope.error = false;
    $scope.currency = {prefix: '$', abbr: 'USD'}

    $scope.loadInventory = function(){
        if(!$scope.username) return;
        $scope.loading = true;
        $scope.error = false;
        $scope.data = {items: [], total: 0};
        $http.jsonp("http://2.123.0.40:8080/api/v1/getInventory?currency=" + $scope.currency.abbr + "&username=" + encodeURIComponent($scope.username) + "&callback=JSON_CALLBACK")
        .success(function(data){
            if(data.success){
                $scope.data = data;
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
    };

    $scope.updateCurrency = function(currency){
        $scope.currency.abbr = $scope.currencies[currency - 1][0];
        $scope.currency.prefix = $scope.currencies[currency - 1][1];
        $scope.loadInventory();
    }
}])
/* http://stackoverflow.com/a/25842874/2536231 */
.filter('currencyFilter', ['$filter','$sce',
    function ($filter, $sce) {
        return function (input, curr) {
            return $sce.trustAsHtml(curr + " " + input);
        }
    }]
);
