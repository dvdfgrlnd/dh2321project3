/* global globalData */
/*
    THINGS TO DO
    
    * WHEN HOVERING OVER A SEGMENT, SHOW THE RELATED INFORMATION
    * SELECT AN AREA (ZOOM) BY CREATING A BOUNING BOX. THE SEGMENTS INSIDE THE BOX WILL NOW TAKE UP THE WHOLE CIRCUMFERENCE
    * GO BACK BY PRESSING IN THE CENTER
    * CREATE LIST WITH FILTERS
    * IN THE INFORMATION AREA, SHOW A DIAGRAM OF DIFFERENT DIMENSIONS (LIKE PARALELL COORDINATES)
    * CREATE A PLAY BUTTON THAT SLOWLY GOES THROUGH ALL THE SEGMENTS LIKE A CLOCK, ALSO HAVE A ROTATING "AXIS" LIKE A CLOCK TO SHOW WHERE YOU ARE  
*/

var params=['Date', 'Daily New Likes', 'Daily Unlikes', 'Daily Page Engaged Users', 'Daily Organic Reach'];
var radarRadius=160;
var radarScale=d3.scale.linear()
            .range([0, radarRadius])
            .domain([0, 1]);
var line = d3.svg.line()
        .x(function (d) { return radarScale(d.x); })
        .y(function (d) { return radarScale(d.y); });

var vis = d3.select("#example").append("svg").append('g')
    .attr('transform', 'translate(0, 0)');

var radius=(d3.select('#example').node().getBoundingClientRect().height / 2),
    arcWidth=radius/5;
var pi = Math.PI,
    twopi=2*pi;
var pie = d3.layout.pie().value(function (d) { return 10; }).padAngle(.0002).sort(null);
var arc = d3.svg.arc()
    .innerRadius((d)=>{return radius-20-(d.data['Daily Organic Reach']/10); })
    .outerRadius(radius);
    
var data=globalData.main;

var pieData=pie(data);
console.log(pieData);
var colors=['black','cyan'];
var groups=vis
    .append('g')
    .attr('id', 'maincircle')
    .selectAll('path')
    .data(pieData)
    .enter()
    .append('g')
    .attr('class', 'arc')
    .attr('transform', 'translate(' + (radius) + ', ' + (radius) + ')')
    .on('mouseenter', function(node){ 
        var rdata=node;
        Object.keys(rdata).forEach((key)=>{
        if(key==='Date' || !params.some((s)=>{ return ~key.indexOf(s); })){
            delete rdata[key];
        }
        updateRadarChart([rdata]);
});
    });
groups.append('path')
    .attr('fill', function (d, i) { return colors[1]; })
    .attr('d', arc);
    
createRadarChart({x:radius, y:radius});
var rdata=globalData.main[100];
Object.keys(rdata).forEach((key)=>{
    if(key==='Date' || !params.some((s)=>{ return ~key.indexOf(s); })){
        delete rdata[key];
    }
});
var rdata2=globalData.main[200];
Object.keys(rdata2).forEach((key)=>{
    if(key==='Date' || !params.some((s)=>{ return ~key.indexOf(s); })){
        delete rdata2[key];
    }
});
updateRadarChart([rdata, rdata2]);
   
var angle=0;
setInterval(()=>{
    d3.select('#maincircle').attr('transform', 'rotate('+(angle+=0.1)+', '+radius+', '+radius+')');
}, 50);   

function getRadarCoordinates(values, maxValue) {
    var dimensions=Object.keys(values[0]);      
    if(!maxValue){
        values.forEach((value)=>{
            // console.log(value);
            // console.log(dimensions);
            var newValue=d3.max(dimensions, (d)=>{ return isNumber(+value[d])?+value[d]:0; });
            if(maxValue===undefined || newValue>maxValue)
                maxValue=newValue;
        });
    }
        
        console.log(maxValue);
    var total=[];
    values.forEach((value)=>{    
        var index = 0;
        var currentAngle = 0,
            angleDelta = ((2 * Math.PI) / dimensions.length);
        var coordinates=[];
        dimensions.forEach(function(d) {
            var c=value[d]/maxValue;
            if(c!==undefined){
                coordinates[index++] = { x: (Math.cos(currentAngle) * c), y: (Math.sin(currentAngle) * c), name: d };
                currentAngle += angleDelta;
            }
        });
        coordinates[index] = coordinates[0];
        // console.log(coordinates);
        total.push(coordinates);
    });
    return total;
}
 
 function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function updateRadarChart(data){
    var coordinates=getRadarCoordinates(data);
    console.log(coordinates);
    var paths=d3.select('#detailchart')
        .selectAll('path')
        .data(coordinates);
    paths.enter()
        .append("path")
        .style("stroke-width", 1)
        .style("stroke", "white")
        .style("fill", "rgba(0, 240, 240, 0.5)");
    paths.exit().remove();
    paths.transition()
    .attr("d", line)
    .duration(1000)
    .ease("linear")
    .attr("transform", null);
}

function createRadarChart(offset) {
    var angleDelta = ((2 * Math.PI) / params.length), 
        angle = 0, index = 0, max = 2 * Math.PI, lines=[];
                
    while (angle < max) {
        lines[index] = [{ x: 0, y: 0 }, { x: (Math.cos(angle)), y: (Math.sin(angle)) }, params[index]];
        index++;
        angle += angleDelta;
    }
    var chart=vis.append("g")
        .attr("class", "radarchart")
        .attr("transform", "translate(" + offset.x + "," + offset.y + ")");
    chart.append("circle")
        .attr("r", radarRadius)
        .attr("fill", "transparent")
        .attr("stroke", "white")
        .attr("stroke-width", 3);
  
    // Create the lines that goes from the center of the chart and out
    chart.append("g").selectAll(".radiusline")
         .data(lines)
         .enter()
         .append("path")
         .attr("d", function (d) { return line([d[0], d[1]]); })
         .attr('stroke-width', 4)
         .style("stroke", "white");
    
    // Create the circles at the end of the lines, that represents the different keys ("questions")
    chart.append("g").selectAll(".typeCircle")
         .data(lines)
         .enter()
         .append("text")
         .text(function(d){ return d[2];})
         .attr("transform", function (d, i) { return 'translate('+radarScale(d[1].x)+','+radarScale(d[1].y)+')'; })
         .attr('dy', '1em')
         .style('fill', 'white')
         .attr("stroke-width", 3);
    // Draw the lines for the radar surface
    chart.append("g")
         .attr("id", 'detailchart');
}