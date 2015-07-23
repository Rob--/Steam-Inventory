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

function createItemObject(item){
    var data = {
        id: item.id,
        classid: item.classid,
        instanceid: item.instanceid,
        pos: item.pos,
        icon_url: item.icon_url,
        icon_url_large: item.icon_url_large,
        name: item.name,
        name_colour: item.name_color,
        inspect: item.actions != undefined ? item.actions[0].link : "",
        tradeable: item.tradable,
        marketable: item.marketable,
        stickers: {text: "", images: []},
        classes: [],
        price: 0.00
    }

    for(var j = 0; j < item.tags.length; j++){
        if(item.tags[j].category == "Type"      ) data.type         = item.tags[j].name;
        if(item.tags[j].category == "Weapon"    ) data.weapon       = item.tags[j].name;
        if(item.tags[j].category == "ItemSet"   ) data.collection   = item.tags[j].name;
        if(item.tags[j].category == "Rarity"    ) data.rarity       = { rarity: item.tags[j].name, colour: item.tags[j].color};
        if(item.tags[j].category == "Exterior"  ) data.exterior     = item.tags[j].name;
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

    var username;

    if(Number(req.query.username)){
        username = req.query.username

        getInventory(req.query.username, function(response){
            res.end(req.query.callback + "(" + JSON.stringify(response) + ")")
        });
    } else {
        request('http://steamcommunity.com/id/' + req.query.username, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    username = cheerio.load(body)("body > div.responsive_page_frame > div > div.responsive_page_nonlegacy_content > script").text().split("steamid")[1].split("\"")[2]
                } catch(e) {
                    return res.end(req.query.callback + "(" + JSON.stringify({success: false, reason: JSON.stringify(e)}, null, 3) + ")");
                }

                getInventory(username, function(response){
                    res.end(req.query.callback + "(" + JSON.stringify(response) + ")")
                });
            }
        });
    }
});

function getInventory(username, callback){
    if(!offers) return callback({success: false, reason: "bot not logged in"})

    offers.loadPartnerInventory({
        appId: 730,
        contextId: 2,
        partnerSteamId: username
    }, function(err, inventory) {
        if(err) return callback({success: false, reason: JSON.stringify(err)})

        var items = [], total = 0;
        for(var i = 0; i < inventory.length; i++){
            var item = createItemObject(inventory[i]);
            items.push(item);
            total += item.price;
        }

        callback({success: true, items: items, total: total})
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
