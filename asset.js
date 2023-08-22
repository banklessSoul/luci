function openNav() {
  document.getElementById("nav").style.width = "250px";
}

function closeNav() {
  document.getElementById("nav").style.width = "0";
}

function closeObservation(id1, id2) {
  document.getElementById(id1).style.visibility = "hidden";
	document.getElementById(id2).style.visibility = "hidden";
}

function addDimension(svg, d) {
    if (d.dimensionType != "timeline") {
        svg.append("rect")
            .attr("id", d.dimension)
            .attr("class", "dimension")
            .attr("x", d.x - d.w / 2)
            .attr("y", d.y - d.h / 2)
            .attr("width", d.w)
            .attr("height", d.h)
            .attr("rx", 10)
            .style("fill", d.color);
    } else {
        addPath(svg, d)
    }
}

function addPath(svg, d) {
    const path = d3.path();
    path.arc(d.x+d.xOff, d.y-d.yOff, d.r, 0, 2 * Math.PI);
    svg
        .append("path")
		.attr("id", d.dimension)
        .attr("class", "dimension")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("fill", d.color);
}

function monumentGame() {
	d3.json("observations.json", function(error, data) {
		var imgBounds = d3.select('#mg').node().getBoundingClientRect();
		var varnish = d3.select("#varnish");

		var svg = varnish
			.append("svg")
			.attr("width", imgBounds.width)
			.attr("height", imgBounds.height);
		data.forEach(function(d) {
			let pos = `coordinate-${d.x}-${d.y}`;
			let observationId = `ob-${pos}`;
		d.xOff = d.xOff == undefined ? 0: d.xOff;
		d.yOff = d.yOff == undefined ? 0: d.yOff;
			varnish.append('div')
				.attr("id", observationId)
				.attr('class', 'observation')
				.attr('left', `${d.x}px`)
				.attr('top', `${d.y}px`)
			   .html(`<h2>${d.textHeader}<span style="float:right;font-weight:normal;cursor:pointer;" onclick=\"closeObservation('${observationId}', '${d.dimension}')\">x</span></h2><p style="font-weight:normal;margin-top:10px">${d.text}</p>`);
			svg.append("svg:image")
				.attr("id", pos)
				.attr("class", `coordinate ${d.dimensionType}`)
				.attr("x", d.x)
				.attr("y", d.y)
				.attr("title", d.text)
				.attr("xlink:href", `./${d.dimensionType}.svg`)
				.on("click", function() {
					d3.select(`#${observationId}`)
						.style("visibility", "visible")
						.style("left", `${window.pageXOffset + d3.event.clientX}px`)
						.style("top", `${window.pageYOffset + d3.event.clientY}px`)
					d3.selectAll(`#${d.dimension}`).style("visibility", "visible");
				});
			addDimension(svg, d);
		});
	});
}

function lineage() {
	var imgBounds = d3.select('#council').node().getBoundingClientRect();
	var w = imgBounds.width,
      h = imgBounds.height,
      start = .5,
      end = 1.3,
      numSpirals = 2;

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };
	
	var svg = d3.select("#lineage").append("svg")
		  .attr("width", w)
		  .attr("height", h)
		  .append("g")
		  .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");
	
	for (var i=0; i<=2; i++) {
		 var r = d3.min([w, h]) / 1.5;

		var radius = d3.scaleLinear()
		  .domain([start, end])
		  .range([50, r]);		

		var points = d3.range(start, end + 0.001, (end - start) / 1000);

		var spiral = d3.radialLine()
		  .curve(d3.curveCardinal)
		  .angle(theta)
		  .radius(radius);

		var path = svg.append("path")
		  .datum(points)
		  .attr("id", "spiral")
		  .attr("class", "lineage")
		  .attr("d", spiral)
		  ;
		  
		start +=.65
		end += .65
	}
   
}
