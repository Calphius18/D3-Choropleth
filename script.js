const EDUCATION_INFO = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
const COUNTY_INFO = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"

let promises = [];

function addJsonReqPromise(url) {
	promises.push(d3.json(url))
}

addJsonReqPromise(COUNTY_INFO);
addJsonReqPromise(EDUCATION_INFO);

Promise.all(promises).then(drawGraph)

function drawGraph(data) {
  let dataEducation = data[1];
  let geographicData = data[0];
  
  const width = 950;
  const height = 600;
  
  let eduMin = d3.min(dataEducation.map( (d) => d.bachelorsOrHigher))
  
  let eduMax = d3.max(dataEducation.map( (d) => d.bachelorsOrHigher));
  
  let colors = d3.schemeReds[7]
  	let colorScale = d3.scaleThreshold()
		.domain(d3.range(eduMin, eduMax, (eduMax-eduMin)/7))
		.range(colors);
  
  function getCountyByFips(fips) {
    var county = dataEducation.find(
    (county) => county.fips === fips);
    return county;
  }
  
  	let section = d3.select("body")
		.append("section")
    
    let heading = d3.select("section")
    .append("heading")
    
    heading
    .append("h1")
    .attr("id", "title")
    .style("font-family", "Trebuchet MS")  
    .text("United States Educational Attainment")
  
  heading 
  .append("h2")
  .attr("id", "description")
  .style("font-family", "Trebuchet MS")
  .style("font-size", "20px")
  .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)")
  
  let svg = section
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  
  let geographicjson = topojson.feature(geographicData, geographicData.objects.counties)
  
  let path = d3.geoPath();
  
  	svg.selectAll("path")
		.data(geographicjson.features)
		.enter()
		.append("path")
			.attr("d", path)
			.attr("class", "county")
			.attr("fill", (d) => colorScale(getCountyByFips(d.id).bachelorsOrHigher))
			.attr("data-fips", (d) => d.id)
			.attr("data-education", (d) => getCountyByFips(d.id).bachelorsOrHigher)
			.on("mouseover", handleMouseOver)
			.on("mosemove", handleMouseMove)
			.on("mouseout", handleMouseOut)
  
  let borders = svg.append("path")
	  	.classed("stateBorder", true)
	  	.attr("fill", "none")
	  	.attr("stroke", "#401917")
    .datum(topojson.mesh(geographicData, geographicData.objects.states), (a, b) => a !== b)
    	.attr('d', path)
  
  let tooltip = d3.select("body")
		.append("div")
			.style("opacity", 0)
			.attr("id", "tooltip")
			.style("position", "absolute")
			.style("background-color", `${colors[5]}`)
			.style("color", "white")
			.style("padding", "10px")
			.style("text-align", "center")
			.style("border-radius", "10%")
  
  function handleMouseOver(key) {
		let county = getCountyByFips(key.id);
		tooltip
				.transition()
				.style("opacity", 0.8)
		tooltip
				.style("left", d3.event.pageX + 10 + "px")
				.style("top", d3.event.pageY + 10 + "px")
				.attr("data-education", `${county.bachelorsOrHigher}`)
				.html(
					`${county["area_name"]}, 
					${county.state}: 
					${county.bachelorsOrHigher}%`
				)
		d3.select(this)
				.style("opacity", 0.2)
	}

	function handleMouseOut(key) {
		tooltip
				.transition()
				.style("opacity", 0)
		tooltip
				.style("left", "-1000px") 
				.style("top", "-1000px") 
		d3.select(this)
				.style("opacity", 1)
	}

	function handleMouseMove(key) {
		tooltip
				.style("left", d3.event.pageX + 10 + "px")
				.style("top", d3.event.pageY + 10 + "px")
	}
  
  	const legendWidth = 200;
	const legendHeight = 10;
	const legendBarLength = legendWidth / colors.length

	let legend = svg
		.append("g")
			.attr("id", "legend")

	let legendScale = d3.scaleLinear()
		.domain([eduMin, eduMax])
		.rangeRound([0, legendWidth])

	let legendAxis = d3.axisBottom(legendScale)
			.tickSize(10)
			.tickSizeOuter(0)
		  .tickFormat(x => `${Math.round(x)}%`)
		  .tickValues(colorScale.domain());

	let colorRange = colorScale
		.range()
	  .map(d => {
	    let inverted = colorScale.invertExtent(d);
	    if (inverted[0] === undefined) {inverted[0] = legendScale.domain()[0];}
	    if (inverted[1] === undefined) {inverted[1] = legendScale.domain()[1];}
	    return inverted;
			});


	let legendColors = legend
		.selectAll("rect")
		.data(colorRange)
		.enter()
		.append("rect")
			.attr("transform", `translate(${width*0.65},40)`)
			.attr("height", 10)
			.attr("width", legendBarLength)
			.attr("x", (d,i) => i*legendBarLength)
			.attr("fill", (d) => colorScale(d[0]))

	function removeLegendDomain(key) {
		key.select(".domain").remove()
	}

	let legendTicks = legend.append("g")
			.attr("id", "legendAxis")
			.attr("transform", `translate(${width*0.65},40)`)
		.call(legendAxis)
		.call(removeLegendDomain)
   
}
