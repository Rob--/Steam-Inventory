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
        $scope.currency.abbr = $scope.currencies[currency][0];
        $scope.currency.prefix = $scope.currencies[currency][1];
        $scope.loadInventory();
    }

    $scope.$on('initialiseTooltips', function(event){
        $('.tooltipped').each(function(){

            //"<p style='font-family:Roboto; margin:5px'>AWP | Dragon Lore (Field-Tested)</p><hr>Float: 0.03242424<hr><img width='70px' height='50px' src='https://steamcdn-a.akamaihd.net/apps/730/icons/econ/stickers/eslkatowice2015/fnatic_holo.958b36604c0485b89dfabe71294f04b25ada7bb4.png'><img width='70px' height='50px' src='https://steamcdn-a.akamaihd.net/apps/730/icons/econ/stickers/stickers2/crown_foil.77c38fe60426ee084fd5c8fec0c680c342e05743.png'><hr><a class='waves-effect waves-light btn' style='background-color:#fff'>Inspect</a><hr>Karambit (Knife), Covert<hr>The Vanguard Collection"

            var item = $scope.data.items[Number($(this).attr('id').replace("item_", ""))];
            console.log(item)
            console.log($(this).attr("id"))
            console.log($(this).attr("ng-attr-id"))
            var data = "<p style='font-family:Roboto; margin:5px'>";
            data += item.hash_name;
            data += "</p><hr><p style='style='font-family:Roboto'>Float:</p> ";
            data += String(item.schema.float);
            data += "<hr>";
            for(var i = 0; i < item.stickers.images.length; i++){
                data += "<img width='70px' height='50px' src='" + item.stickers.images[i] + "'>";
            }
            data += "<hr><a class='waves-effect waves-light btn' href='" + item.inspect + "'>Inspect</a><hr>";
            data += item.weapon + "(" + item.type + "), " + item.rarity.rarity + "<hr>";
            data += item.collection;

            $(this).attr("data-tooltip", data);

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
.directive('repeatDirective', function() {
  return function(scope) { if(scope.$last) scope.$emit('initialiseTooltips'); };
})
