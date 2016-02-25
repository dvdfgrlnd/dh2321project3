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

var params=['Date', 'Daily New Likes', 'Daily Unlikes', 'Daily Page Engaged Users', 'Daily Organic Reach', 'posts'];

var vis = d3.select("#example").append("svg").append('g')
    .attr('transform', 'translate(0, 0)');
var bRect=d3.select('#example').node().getBoundingClientRect();
var radius=((bRect.width>bRect.height?bRect.height:bRect.width) / 2),
    arcWidth=radius/5;
d3.select('#example').style('height', (radius*2.2));
var pi = Math.PI,
    twopi=2*pi;
var pie = d3.layout.pie().value(function (d) { return 10; }).padAngle((0.155/globalData.main.length)).sort(function(a, b){ return a.Date.getTime()-b.Date.getTime(); });
var arc = d3.svg.arc()
    .innerRadius((d)=>{return radius-20-(d.data['Daily Organic Reach']/10); })
    .outerRadius(radius);
var radarRadius=radius*0.6;
var radarScale=d3.scale.linear()
            .range([0, radarRadius])
            .domain([0, 1]);
var line = d3.svg.line()
        .x(function (d) { return radarScale(d.x); })
        .y(function (d) { return radarScale(d.y); });
    
var data=globalData.main;
// Previous data in radar chart 
var previousData=null;
var previousSelection=null;
var timer=null;
data.forEach((d)=>{convertData(d);});

var maxValues={};
var keys=Object.keys(data[0]);
keys.forEach((d)=> {
    var y = d3.scale.pow().exponent(.1)
    .domain(d3.extent(data, (p)=>{ return +p[d]; }))
    .range([0, 1]);
    maxValues[d]=y;
});
console.log(maxValues);
// Create radar chart
var k=keys.slice();
k.splice(k.indexOf('Date'), 1);
k.splice(k.indexOf('posts'), 1);
createRadarChart({x:radius, y:radius}, k);
var pieData=pie(data);
// console.log(data);
// console.log(pieData);
var colors=['black','rgba(0, 240, 240, 1)'];
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
        if(!previousSelection)
            showTooltip(node.data);
            
        if(timer){
            clearTimeout(timer);
            clearInterval(timer);
            timer=null;
        }
             
        // console.log(node);
        var ar=[node.data];
        if(previousSelection!==null){
            var prev=d3.select(previousSelection);
            // console.log(prev.data().shift());
            ar.push(prev.data().shift().data);
        }
        // console.log(ar);
        updateRadarChart(ar);
        var date=formatDate(node.data.Date);
        d3.select('#yeartext').text(date);
    })
    .on('click', function(node){
        if(previousSelection===this){
            d3.select(this).select('path').style('fill', colors[1]);
            previousSelection=null;
        }else{
            var ar=[node.data];
            if(previousSelection!==null){
                var prev=d3.select(previousSelection);
                prev.select('path').style('fill', colors[1]);
                // console.log(prev.data());
                ar.push(prev.data().shift().data);
            }
                
            updateRadarChart(ar);
            // console.log(this);
            previousSelection=this;
            d3.select(this).select('path').style('fill', 'red');
            showTooltip(node.data);            
        }
    })
    .on('mouseleave', function(node){
        if(!previousSelection){
            timer=setTimeout(()=>{
                timer=rotateChart();
                d3.select(previousSelection).select('path').style('fill', colors[1]);
                // d3.select('#yeartext').text('');
            }, 1000);
        }
    });
groups.append('path')
    .attr('fill', function (d, i) { return colors[1]; })
    .attr('d', arc);
    
vis.append('rect')
    .attr('transform', 'translate('+radius+',0)')
    .attr('width', 15)
    .attr('height', 20)
    .attr('fill', 'orange');
    
vis.append('text')
    .attr('font-size', 25)
    .attr('id', 'yeartext')
    .style('fill', 'orange')
    .attr('x', (radius*2)-40)
    .attr('y', (radius*2));
    
var rdata=globalData.main[100];
var rdata2=globalData.main[200];
updateRadarChart([rdata, rdata2]);
timer=rotateChart();

var index=100;
var angleOfChange=360/globalData.main.length;
var angle=(index*angleOfChange);
var rotationSpeed=0.05;
function rotateChart(){
    var t=setInterval(()=>{
        d3.select('#maincircle').attr('transform', 'rotate(-'+(angle+=rotationSpeed)+', '+radius+', '+radius+')');
        if(angle>(index*angleOfChange)){
            var node=pieData[index++];
            convertData(node.data);
            if(previousData!==null){
                var diff=calculateDifference(node.data, previousData);
                // console.log(diff);
                updateRadarChart([node.data, diff]);
            }
                
            previousData=node.data;
            
            if(index===globalData.main.length){
                index=0;
                angle=(index*angleOfChange);                
            }
                
            var date=formatDate(node.data.Date);
            d3.select('#yeartext').text(date);  
        }
    }, 50);
    return t;
}

function formatDate(date){
    var formated=(date.getMonth()+1)+'-'+date.getDate()+'-'+date.getFullYear();
    return formated;
}

function applyFilters(filters) {
    d3.selectAll('.arc path')
        .style('fill', colors[1])
        .filter(function(d){ return !filters.every((elem)=> elem(d)); })
        .style('fill', 'gray');
}

function calculateDifference(dataOne, dataTwo){
    var newElement={};
    Object.keys(dataOne).forEach((key)=>{
        newElement[key]=dataOne[key]-dataTwo[key];
        if(newElement[key]<0)
            newElement[key]=0;
    });
    return newElement;
}

function showTooltip(data){
    var html=getHtml(data);
    d3.select('.tooltip').html(html);
}

function getHtml(data){
    var html='';
    Object.keys(data).forEach((key)=>{
        var val='';
        if(data[key] instanceof Date){
            val=formatDate(data[key]);
        } else if(typeof(data[key])==='object'){
            val=getHtml(data[key]);
        }else{
            val=data[key];
        }
        html+=(key+': '+val);
        html+='<br>';
    });
    return html;
}

function convertData(rdata){
    Object.keys(rdata).forEach((key)=>{
        if(!params.some((s)=>{ return key.indexOf(s)===0; })){
            delete rdata[key];
        }
        else if(key==='Date'){
            rdata[key]=new Date(rdata[key]);
        }
    });
}

function getRadarCoordinates(values, maxValue, dimensions) {
    if(!dimensions){
        dimensions=Object.keys(values[0]);
    }
        
    // console.log(dimensions);
    if(!maxValue){
        dimensions.forEach((key)=>{
            var newValue=d3.max(values, (d)=>{ return isNumber(+d[key])?+d[key]:0; });
            if(maxValue[key]===undefined || newValue>maxValue[key])
                maxValue[key]=newValue;
        });
    }
        
    // console.log(maxValue);
    var total=[];
    values.forEach((value)=>{    
        var index = 0;
        var currentAngle = 0,
            angleDelta = ((2 * Math.PI) / dimensions.length);
        var coordinates=[];
        dimensions.forEach(function(d) {
            var y=maxValue[d];
            var c=y((+value[d]));
            // console.log(maxValue[d].range());
            // console.log(d+' '+c+' '+value[d]+' ');
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
    var coordinates=getRadarCoordinates(data, maxValues, k);
    // console.log(coordinates);
    var color=["rgba(0, 240, 240, 0.3)", "rgba(250, 0, 0, 0.4)"]
    var paths=d3.select('#detailchart')
        .selectAll('path')
        .data(coordinates);
    paths.enter()
        .append("path")
        .style("stroke-width", 1)
        .style("stroke", "white")
        .style("fill", (d,i)=>{ return color[i%2];});
    paths.exit().remove();
    paths.transition()
    .attr("d", line)
    .duration(1500)
    .ease("linear")
    .attr("transform", null);
}

function createRadarChart(offset, params) {
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
         .attr('font-size', 15)
         .attr("transform", function (d, i) { return 'translate('+radarScale(d[1].x)+','+radarScale(d[1].y)+')'; })
         .attr('dy', '1em')
         .attr('text-anchor', 'middle')
         .style('fill', 'white')
         .attr("stroke-width", 3);
    // Draw the lines for the radar surface
    chart.append("g")
         .attr("id", 'detailchart');
}

function handleFilter(obj){
    var filters=[];
    d3.selectAll('.check').each(
        function(d, i){
            var fun;
            if(this.id==='videoInput' && this.checked){
                console.log('video');
                fun=(d)=>{ return d.data.posts.filter((p)=>p.Type==='Video').length>0;};
                filters.push(fun);
            } else if(this.id==='statusInput' && this.checked){
                console.log('status');
                fun=(d)=>{ return d.data.posts.filter((p)=>p.Type==='Status').length>0;};
                filters.push(fun);
            } else if(this.id==='linkInput' && this.checked){
                console.log('link');
                fun=(d)=>{ return d.data.posts.filter((p)=>p.Type==='Link').length>0;};
                filters.push(fun);
            } else if(this.id==='photoInput' && this.checked){
                console.log('photo');
                fun=(d)=>{ return d.data.posts.filter((p)=>p.Type==='Photo').length>0;};
                filters.push(fun);
            }
        });
    applyFilters(filters);
}

function clearSelection(obj){
    if(timer){
        clearTimeout(timer);
        clearInterval(timer);
        timer=null;
    }
    d3.select(previousSelection).select('path').style('fill', colors[1]);
    previousSelection=null;
    timer=rotateChart();
    showTooltip({});
}