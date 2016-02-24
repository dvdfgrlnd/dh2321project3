var fs=require('fs');
var filters=['Date', 'Daily New Likes', 'Daily Unlikes', 'Daily Page Engaged Users', 'Daily Total Reach', 'Daily Organic Reach', 'Daily Paid Reach', 'Daily Total Impressions', 'Daily Organic impressions', 'Daily Paid Impressions', 'Daily Logged-in Page Views', 'Daily Organic Reach of Page posts', 'Lifetime Likes by City'];
var files=['s1', 's2', 's3', 's4', 's5'];
var postFiles=['p1', 'p3', 'p4', 'p5'];
var combined=[];
var postFilters=['Posted', 'Type','Lifetime Post consumers by type', 'Lifetime Post Stories by action type', 'Lifetime Post Total Impressions', 'Lifetime Post organic reach', 'Lifetime Engaged Users'];
// readFiles();
// readPostFiles();
// addPostsToTotal();

function readFiles(){
    var readFiles=0;
    combined=[];
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
}

function readPostFiles(){
    var readFiles=0;
    combined=[];
    postFiles.forEach(function (fileName) {
        fs.readFile('data/'+fileName+'.json', 'utf8', function(err, text){
            var data=JSON.parse(text);
            data.forEach(function(item){
                if(item['Posted']!==''){
                    var keys=Object.keys(item);
                    for(var i=keys.length-1;i>=0;i--) {
                        var key=keys[i];
                        if(!postFilters.some(function(s){return key.indexOf(s)===0;})){
                            delete item[key];
                        }
                    }
                    combined.push(item);
                }
            });
            readFiles++;
            console.log('Files filtered = '+readFiles);
            if(readFiles===postFiles.length)
                fs.writeFile('data/pFiltered.json', JSON.stringify(combined), 'utf8');
        });
    });
}

function addPostsToTotal(){
    var text=fs.readFileSync('data/sFiltered.json', 'utf8');
    var textp=fs.readFileSync('data/pFiltered.json', 'utf8');
    var data=JSON.parse(text);
    var posts=JSON.parse(textp);
    data.forEach(function(item){
        var filteredPosts=posts.filter(function(d){ return d.Posted?sameDate(d.Posted, item.Date):false;});
        // if(filteredPosts.length!==0)
        //     console.log(filteredPosts);
            
        item.posts=filteredPosts;
    });
    fs.writeFile('data/total.json', JSON.stringify(data), 'utf8');
}

function sameDate(sOne, sTwo){
    var dateOne=new Date(sOne);
    var dateTwo=new Date(sTwo);
    // if((dateOne.getMonth()===dateTwo.getMonth())&&(dateOne.getDate()===dateTwo.getDate())&&(dateOne.getFullYear()===dateTwo.getFullYear()))
    //     console.log(sOne+'   '+ sTwo);
        
    return (dateOne.getMonth()===dateTwo.getMonth())&&(dateOne.getDate()===dateTwo.getDate())&&(dateOne.getFullYear()===dateTwo.getFullYear());
}