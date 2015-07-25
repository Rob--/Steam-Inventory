var fs = require("fs");
var app = require("express")();
var steamweb = require("steam-web");
var SteamTradeOffers = require("steam-tradeoffers");
var offers = new SteamTradeOffers()
var Steam = require("steam");
var steamapi;
var cheerio = require("cheerio");
var request = require("request");

app.listen(Number(process.env.PORT) || 8080, "0.0.0.0")

fs.readFile('config.json', 'utf8', function (err, data) {
  if (err) throw err;
  steamapi = new steamweb({ apiKey: JSON.parse(data).apikey, format: "json" });
  loginBot(JSON.parse(data).login);
});

/*
    {
     'skin': {
            // 0 = Factory-New
          '0': {
                'price' : 0.00,
                'cache' : timestamp
            }
        }
    }
 */
var prices = {};

var wears = ["Vanilla", "Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];
var conversion = {};

updateConversion();
setTimeout(updateConversion, 43200000 /* 12 hours */);

function createItemObject(item){
    var data = {
        id: item.id,
        classid: item.classid,
        instanceid: item.instanceid,
        pos: item.pos,
        icon_url: item.icon_url,
        icon_url_large: item.icon_url_large,
        name: item.name,
        hash_name: item.market_hash_name,
        name_colour: item.name_color,
        inspect: item.actions != undefined ? item.actions[0].link : "",
        tradeable: item.tradable,
        marketable: item.marketable,
        stickers: {text: "", images: []},
        classes: []
    }

    for(var j = 0; j < item.tags.length; j++){
        if(item.tags[j].category == "Type"      ) data.type         = item.tags[j].name;
        if(item.tags[j].category == "Weapon"    ) data.weapon       = item.tags[j].name;
        if(item.tags[j].category == "ItemSet"   ) data.collection   = item.tags[j].name;
        if(item.tags[j].category == "Rarity"    ) data.rarity       = { rarity: item.tags[j].name, colour: item.tags[j].color};
        if(item.tags[j].category == "Exterior"  ) data.exterior     = item.tags[j].name;
    }

    if(data.type.toLowerCase().indexOf("sticker")       > -1
    || data.type.toLowerCase().indexOf("tool")          > -1
    || data.type.toLowerCase().indexOf("case")          > -1
    || data.type.toLowerCase().indexOf("key")           > -1
    || data.exterior.toLowerCase().indexOf("painted")   > -1)
        data.exterior = "Vanilla";

    if(!prices[data.name]){
        prices[data.name] = {
            0: {},
            1: {},
            2: {},
            3: {},
            4: {},
            5: {}
        };
    }
    
    if(prices[data.name][wears.indexOf(data.exterior)].price == undefined){
        getItemPrice(1, 730, data.hash_name, data.name, data.exterior);
        data.price = "0.00";
    } else {
        if(Date.now() - prices[data.name][wears.indexOf(data.exterior)]['cache'] < 1200000) getItemPrice(1, 730, data.hash_name, data.name, data.exterior);
        data.price = prices[data.name][wears.indexOf(data.exterior)]['price'];
    }

    if(data.type.toLowerCase().indexOf("knife") > -1) data.classes.push("knife")
    if(data.name.toLowerCase().indexOf("souvenir") > -1) data.classes.push("souvenir")
    if(data.name.toLowerCase().indexOf("stattrak") > -1) data.classes.push("stattrak")

    for(var j = 0; j < item.descriptions.length; j++){
        if(item.descriptions[j].value.indexOf("Sticker Details") == -1) continue;

        $ = cheerio.load(item.descriptions[j].value.replace('\"', ''));
        for(var k = 0; k < $("img").length; k++){
            data.stickers.images.push($($("img")[k]).attr("src"));
        }
        data.stickers.text = $("div").text();
    }

    return data;
}

app.get("/api/v1/getInventory", function(req, res){
    res.setHeader('Content-Type', 'application/json');

    if(req.query.username == undefined) return res.end(req.query.callback + "(" + JSON.stringify({success: false, reason: "username not defined"}, null, 3) + ")");

    var currency = req.query.currency == undefined ? "USD" : req.query.currency.toUpperCase();

    if(Number(req.query.username)){
        getInventory(req.query.username, currency, function(response){
            res.end(req.query.callback + "(" + JSON.stringify(response) + ")")
        });
    } else {
        resolveUsername(req.query.username, function(err, sid){
            if(err) res.end(req.query.callback + "(" + JSON.stringify({success: false, reason: "cannot resolve username"}) + ")")

            getInventory(sid, currency, function(response){
                res.end(req.query.callback + "(" + JSON.stringify(response) + ")")
            });
        });
    }
});

function resolveUsername(username, callback){
    request('http://steamcommunity.com/id/' + username, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                return callback(null, cheerio.load(body)("body > div.responsive_page_frame > div > div.responsive_page_nonlegacy_content > script").text().split("steamid")[1].split("\"")[2]);
            } catch(e) {
                // fall back to method 2
            }
        }

        request('http://steamid.co/ajax/steamid.php?ddd=' + username, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    return callback(null, JSON.parse(body).steamID64);
                } catch(e) {
                    return callback(true, null);
                }
            }
        });
    });
}

function getInventory(username, currency, callback){
    if(!offers) return callback({success: false, reason: "bot not logged in"})

    offers.loadPartnerInventory({
        appId: 730,
        contextId: 2,
        partnerSteamId: username
    }, function(err, inventory) {
        // I've only ever seen the value of 'err' be '{}'
        // Great job Steam
        if(err) return callback({success: false, reason: JSON.stringify(err)})

        // Populate items list
        var items = [];
        for(var i = 0; i < inventory.length; i++){
            var item = createItemObject(inventory[i]);
            items.push(item);
        }

        // Convert currencies, prefix is added client side
        var total = 0;
        for(var i = 0; i < items.length; i++){
            total += Number(items[i].price = (items[i].price *= conversion[currency]).toFixed(2))
        }

        items.sort(function(a,b) { return parseFloat(b.price) - parseFloat(a.price) } );

        callback({success: true, items: items, total: Number(total).toFixed(2)})
    })

    /*steamapi.getPlayerItems({
        gameid: 730,
        steamid: '76561198090927398',
        callback: function(err, data) {
            //console.log(req.get('host'))
            //console.log(req.get('origin'))

            var inventory = data.result.items, items = [];
            for(var i = 0; i < inventory.length; i++){
                items.push(createItemObject(inventory[i]));
            }
            res.end(JSON.stringify(data, null, 3));
        }
    });*/
}

function getItemPrice(curr, appid, hash_name, name, exterior){
    if(!hash_name || !name || !exterior) return;

    request("http://steamcommunity.com/market/priceoverview/?currency=" + curr + "&appid=" + appid + "&market_hash_name=" + encodeURI(hash_name), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);

            if(data.success){
                prices[name][wears.indexOf(exterior)]['price'] = data.median_price ? Number(data.median_price.split(";")[1]) : data.lowest_price ? Number(data.lowest_price.split(";")[1]) : "N/A"
                prices[name][wears.indexOf(exterior)]['cache'] = Date.now();
            }
        }
    });
}

function updateConversion(){
    request("http://api.fixer.io/latest?base=USD", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            conversion = JSON.parse(body).rates;
            conversion["USD"] = 1;
        }
    });
}

function loginBot(details){
    var client = new Steam.SteamClient()

    if(fs.existsSync('sentry.' + details.accountName + '.hash')){ details.shaSentryfile = fs.readFileSync('sentry.' + details.accountName + '.hash'); }

    client.logOn(details);
    client.on('debug', console.log);
    client.on('error', console.log);

    client.on('loggedOn', function() {
        console.log('logged into ' + details.accountName + ' bot successfully, changing status to offline.');
        client.setPersonaState(Steam.EPersonaState.Offline);
    });

    client.on('webSessionID', function(sessionID) {
        client.webLogOn(function(newCookie){
            offers.setup({ sessionID: sessionID, webCookie: newCookie });
            console.log('logged in (' + sessionID + ')');
        });
    });

    client.on('sentry', function(data) { fs.writeFileSync('sentry.' + details.accountName + '.hash', data); });
}
