var fs=require('fs');
var filters=['Date', 'Daily New Likes', 'Daily Unlikes', 'Daily Page Engaged Users', 'Daily Total Reach', 'Daily Organic Reach', 'Daily Paid Reach', 'Daily Total Impressions', 'Daily Organic impressions', 'Daily Paid Impressions', 'Daily Logged-in Page Views', 'Daily Organic Reach of Page posts', 'Lifetime Likes by City'];
var files=['s1', 's2', 's3', 's4', 's5'];
var combined=[];
var readFiles=0;
files.forEach(function (fileName) {
    fs.readFile('data/'+fileName+'.json', 'utf8', function(err, text){
        var data=JSON.parse(text);
        data.forEach(function(item){
            if(item['Date']!==''){
                var keys=Object.keys(item);
                for(var i=keys.length-1;i>=0;i--) {
                    var key=keys[i];
                    if(!filters.some(function(s){return ~key.indexOf(s);})){
                        delete item[key];
                    }
                }
                combined.push(item);
            }
        });
        readFiles++;
        console.log('Files filtered = '+readFiles);
        if(readFiles===files.length)
            fs.writeFile('data/sFiltered.json', JSON.stringify(combined), 'utf8');
    });
});