/* global globalData */
var params=['Date', 'Daily New Likes', 'Daily Unlikes', 'Daily Page Engaged Users', 'Daily Organic Reach'];
var data=globalData.main;
var daysToExtract=['1'];
data.forEach((item)=>{
    var keys=Object.keys(item);
    for(var i=keys.length-1;i>=0;i--) {
        var key=keys[i];
        if(!params.some(function(s){return ~key.indexOf(s);})){
            delete item[key];
        }
    }
});
var remove=[];
data.forEach((item, index)=>{
    var date=item.Date.split('/');
    console.log(date[1]);
    if(daysToExtract.some(function(s){ return (s!==date[1]); })) {
        remove.push(index);
    }
});
remove.forEach((index)=>{
    console.log('Remove '+index);
});
data.splice(30, data.length-51);
console.log(data);
var pc = d3.parcoords()("#example")
  .data(data)
  .render()
  .ticks(3)
  .createAxes()
  .brushMode("1D-axes")  // enable brushing
  .reorderable();