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
            .attr("id", `highlight-${d.x}-${d.y}`)
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
		.attr("id", `highlight-${d.x}-${d.y}`)
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
			let highlightId = `highlight-${d.x}-${d.y}`;
		d.xOff = d.xOff == undefined ? 0: d.xOff;
		d.yOff = d.yOff == undefined ? 0: d.yOff;
			varnish.append('div')
				.attr("id", observationId)
				.attr('class', 'observation')
				.attr('left', `${d.x}px`)
				.attr('top', `${d.y}px`)
			   .html(`<h2>${d.textHeader}<span style="float:right;font-weight:normal;cursor:pointer;" onclick=\"closeObservation('${observationId}', '${highlightId}')\">x</span></h2><p style="font-weight:normal;margin-top:10px">${d.text}</p>`);
			svg.append("svg:image")
				.attr("id", pos)
				.attr("class", `coordinate ${d.dimensionType}`)
				.attr("x", d.x)
				.attr("y", d.y)
				.attr("title", d.textHeader)
				.attr("xlink:href", `./${d.dimensionType}.svg`)
				.on("click", function() {
					d3.select(`#${observationId}`)
						.style("visibility", "visible")
						.style("left", `${window.pageXOffset + d3.event.clientX}px`)
						.style("top", `${window.pageYOffset + d3.event.clientY}px`)
					d3.selectAll(`#${highlightId}`).style("visibility", "visible");
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
		  
		  console.log(spiral)

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

function getColorForScore(score) {
   const brightness = Math.abs(score) / 100; 

   if (score >= 70) {
      const red = 0;
      const green = 255 * brightness;
      const blue = 102 * brightness;
      return `rgba(${red}, ${green}, ${blue}, .8)`;
   } else {
      const red = 255;
      const green = Math.max(0, 255 - 255 * brightness);
      const blue = Math.max(0, 255 - 255 * brightness);
      return `rgba(${red}, ${green}, ${blue}, .7)`;
   }
}


function updateSVG(connections, minScore) {
   try {
      const originalWidth = 8100;
      const originalHeight = 3389;
      const container = document.getElementById('masq');
      const img = document.getElementById('masq-img');
      const svg = d3.select("#overlay");

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const scale = Math.min(containerWidth / originalWidth, containerHeight / originalHeight);
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;

      const marginX = (containerWidth - scaledWidth) / 2;
      const marginY = (containerHeight - scaledHeight) / 2;

      svg.attr("viewBox", `0 0 ${originalWidth} ${originalHeight}`)
         .attr("width", scaledWidth)
         .attr("height", scaledHeight)
         .style("margin", `${marginY}px ${marginX}px`);

      // Create a path generator for curved lines
      const lineGenerator = d3.line()
         .x(d => d[0])
         .y(d => d[1])
         .curve(d3.curveBasis);

      // Draw curved lines
      const paths = svg.selectAll("path")
         .data(connections.filter(d => d.correlationScore >= minScore))
         .join("path")
         .attr("d", d => {
            const midX = (d.x[0] + d.y[0]) / 2;
            const midY = (d.x[1] + d.y[1]) / 2;
            const controlPoint = [midX, midY - 200]; // Adjust this value to change the curve
            return lineGenerator([d.x, controlPoint, d.y]);
         })
         .style("fill", "none")
         .style("stroke", d => getColorForScore(d.correlationScore))
         .style("stroke-width", d => 5);

      paths.join("path")
         .style("opacity", d => Math.max(0, (d.correlationScore - minScore + 10) / 10)); // Gradual fade out

      // Remove all existing circles and text
      svg.selectAll("circle").remove();
      svg.selectAll("text").remove();

      // Update circles and text
      const circlesAndText = svg.selectAll("g")
         .data(connections.flatMap(d => [{
            point: d.x,
            id: d.id,
            score: d.correlationScore
         }, {
            point: d.y,
            id: d.id,
            score: d.correlationScore
         }]), d => d.id + d.point);

      circlesAndText.exit().remove(); // Remove circles and text for data points that no longer match the condition

      const circles = circlesAndText.enter()
         .append("g")
         .merge(circlesAndText)
         .filter(d => d.score >= minScore);

      circles.selectAll("circle")
         .data(d => [d])
         .join("circle")
         .attr("cx", d => d.point[0])
         .attr("cy", d => d.point[1])
         .attr("r", 20)
         .style("fill", `rgba(255, 255, 255, 0.7)`);

      circles.selectAll("text")
         .data(d => [d])
         .join("text")
         .attr("x", d => d.point[0] + 25)
         .attr("y", d => d.point[1] + 5)
         .text(d => {
            const labelParts = d.id.split(" ");
            const numberPart = labelParts.find(part => part.startsWith("#"));
            if (d.score > 75) {
               if (numberPart) {
                  return numberPart.includes("125") ? "" : numberPart.split("/")[0]; 
               }
            }
            return "";
         })
         .style("font-size", "50px")
         .style("fill", "white");
   } catch (error) {
      console.error("Error loading or parsing JSON:", error);
   }
}

function animateConnections() {
   const svg = d3.select("#overlay");

   svg.selectAll("path")
      .each(function (d, i) {
         const totalLength = this.getTotalLength();
         d3.select(this)
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(300)
            .delay(i * 100)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
      });
}

let masquradeData;

async function loadData() {
   try {
      const response = await fetch("./masqurade.json");
      if (!response.ok) {
         throw new Error(`HTTP error! status: \${response.status}`);
      }
      masquradeData = await response.json();
   } catch (error) {
      console.error("Error loading or parsing JSON:", error);
   }
}

function updateConnectionsAndRender(minScore = 0) {
   const viewportWidth = window.innerWidth;
   const viewportHeight = window.innerHeight;

   // Adjust these values based on your desired positioning
   const xOffsetFactor = .02; // Adjust between 0 and 1
   const yOffsetFactor = 0; // Adjust between 0 and 1

   const xOffset = -(viewportWidth * xOffsetFactor);
   const yOffset = -(viewportHeight * yOffsetFactor);

   const connections = Object.entries(masquradeData).slice(0, 140).map(([key, value]) => ({
      id: key,
      x: [5503 + xOffset, 1533 + yOffset],
      y: [value.x + xOffset, value.y + yOffset],
      correlationScore: value.correlationScore
   }));

   updateSVG(connections, minScore);
   animateConnections();
}

async function masqurade() {
   await loadData();
   updateConnectionsAndRender();

   // Add event listener for slider
   const slider = document.getElementById('slider');
   slider.addEventListener('input', () => {
      const minScore = parseInt(slider.value, 10);
      const sliderValue = document.getElementById('slider-value');
      sliderValue.textContent = minScore;
      updateConnectionsAndRender(minScore);
   });

   // Add event listener for window resize
   window.addEventListener('resize', updateConnectionsAndRender);
}
