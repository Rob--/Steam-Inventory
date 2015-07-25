require('angular');

var app = angular.module('inventoryLoader', []);

app.controller('inventoryCtrl', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
    $scope.currencies = [
        ['USD', '$'],
        ['GBP', '£'],
        ['EUR', '&euro;'],
        ['AUD', '$'],
        ['BGN', 'лв'],
        ['BRL', 'R$'],
        ['CAD', '$'],
        ['CHF', 'CHF'],
        ['CNY', '¥'],
        ['CZK', 'Kč'],
        ['DKK', 'kr'],
        ['HKD', '$'],
        ['HRK', 'kn'],
        ['HUF', 'Ft'],
        ['IDR', 'Rp'],
        ['ILS', '₪'],
        ['INR', '₹'],
        ['JPY', '¥'],
        ['KRW', '₩'],
        ['MXN', '$'],
        ['MYR', 'RM'],
        ['NOK', 'kr'],
        ['NZD', '$'],
        ['PHP', '₱'],
        ['PLN', 'zł'],
        ['RON', 'lei'],
        ['RUB', 'руб'],
        ['SEK', 'kr'],
        ['SGD', '$'],
        ['THB', '฿'],
        ['TRY', '₺'],
        ['ZAR', 'R']
    ];

    $scope.data = {items: [], total: 0}
    $scope.columnSize = 1;
    $scope.loading = false;
    $scope.error = false;
    $scope.currency = {prefix: '$', abbr: 'USD'}

    $scope.loadInventory = function(){
        $scope.loading = true;
        $scope.error = false;
        $scope.data = {items: [], total: 0};
        $http.jsonp("http://2.120.163.83:8080/api/v1/getInventory?currency=" + $scope.currency.abbr + "&username=" + encodeURIComponent($scope.username) + "&callback=JSON_CALLBACK")
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
        $scope.currency.prefix = $scope.currencies[currency - 1][0];
        $scope.currency.abbr = $scope.currencies[currency - 1][1];
    }
}])
/* http://stackoverflow.com/a/25842874/2536231 */
.filter('currencyFilter', ['$filter','$sce',
    function ($filter, $sce) {
        return function (input, curr) {
            return $sce.trustAsHtml(curr);
        }
    }]
);
