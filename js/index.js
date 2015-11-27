require('angular');

var app = angular.module('inventoryLoader', []);

app.controller('inventoryCtrl', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
    $scope.currencies = [
        ['USD', '&dollar;'], ['GBP', '&pound;'], ['EUR', '&euro;'], ['AUD', '&dollar;'], ['BGN', '&#1083;'], ['BRL', 'R&dollar;'], ['CAD', '&dollar;'],
        ['CHF', 'CHF'], ['CNY', '&#165;'], ['CZK', 'K&#269;'], ['DKK', 'kr'], ['HKD', '&dollar;'], ['HRK', 'kn'], ['HUF', 'Ft'], ['IDR', 'Rp'], ['ILS', '&#8362;'], ['INR', '&#8377;'],
        ['JPY', '&#165;'], ['KRW', '&#8361;'], ['MXN', '&dollar;'], ['MYR', 'RM'], ['NOK', 'kr'], ['NZD', '&dollar;'],
        ['PHP', '&#8369;'], ['PLN', 'z&#322;'], ['RON', 'lei'], ['RUB', 'ру&#1073;'], ['SEK', 'kr'], ['SGD', '&dollar;'], ['THB', '&#3647;'], ['TRY', '&#8378;'], ['ZAR', 'R']
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
        $http.jsonp("https://steamio-server.herokuapp.com/api/v1/getInventory?currency=" + $scope.currency.abbr + "&username=" + encodeURIComponent($scope.username) + "&callback=JSON_CALLBACK")
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
        $scope.currency.abbr = $scope.currencies[currency][0];
        $scope.currency.prefix = $scope.currencies[currency][1];
        $scope.loadInventory();
    }

    $scope.$on('initialiseTooltips', function(event){
        $('.tooltipped').each(function(){
            try{
                var item = $scope.data.items[Number($(this).attr('id').replace("item_", ""))];

                var data = "<p style='font-family:Roboto; margin:5px'>";
                data += item.hash_name;
                data += item.nametag ? "<br>'" + item.nametag + "'": "";
                data += "</p><hr>";

                // this will throw an error if it's undefined
                try{
                    if(typeof(item.schema.float) !== undefined) data += "Float: " + String(item.schema.float) + "<hr>";
                } catch(e) {
                    // do nothing
                }
                for(var i = 0; i < item.stickers.images.length; i++){
                    data += "<img width='70px' height='50px' src='" + item.stickers.images[i] + "'>";
                }
                data += item.stickers.images.length > 0 ? "<hr>" : ""
                //data += item.weapon + " (" + item.type + "), " + item.rarity.rarity;
                data += item.collection ? item.collection : "";

                $(this).attr("data-tooltip", data);
            } catch(e) {
                // do nothing
            }
        });

        $('.tooltipped').tooltip();
    });
}])
/* http://stackoverflow.com/a/25842874/2536231 */
.filter('currencyFilter', ['$filter','$sce',
    function ($filter, $sce) {
        return function (input, curr) {
            return $sce.trustAsHtml(curr + " " + input);
        }
    }]
)
.directive('repeatDirective', function ($timeout) {
    return { restrict: 'A', link: function (scope, element, attr) { if(scope.$last) $timeout(function () { scope.$emit('initialiseTooltips'); }); } }
});
