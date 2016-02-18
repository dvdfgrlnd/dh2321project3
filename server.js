var fs=require('fs');
var filters=['Lifetime Total Likes', 'Daily Page Engaged Users', 'Daily Total Reach', 'Daily Organic Reach', 'Daily Paid Reach', 'Daily Total Impressions', 'Daily Organic impressions', 'Daily Paid Impressions', 'Daily Logged-in Page Views', 'Daily Organic Reach of Page posts', 'Lifetime Likes by City'];
fs.readFile('data/stats.json', 'utf8', function(err, text){
    var data=JSON.parse(text);
    data.forEach(function(item){
        var keys=Object.keys(item);
        for(var i=keys.length-1;i>0;i--) {
            var key=keys[i];
            if(!filters.some(function(s){return ~key.indexOf(s);})){
                delete item[key];
            }
        }
    });
    
    fs.writeFile('data/statsFiltered.json', JSON.stringify(data), 'utf8');
});