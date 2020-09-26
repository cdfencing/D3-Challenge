// svg container
var svgHeight = 600;
var svgWidth = 800;

// create margins
var margin = {
  top: 50,
  right: 50,
  bottom: 125,
  left: 125
};

// chart area minus the margins
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth = svgWidth - margin.left - margin.right;

// create the svg container
var svg = d3.select("#scatter").append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// shift everything over
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Import Data
d3.csv("assets/data/data.csv").then(function(censusData) {

  console.log(censusData);

    censusData.forEach(function(data) {
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
    });

  // Create scale functions
  
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d.healthcare) -2, d3.max(censusData, d => d.healthcare) + 2])
    .range([chartHeight, 0]);
    
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d.poverty) - 1, d3.max(censusData, d => d.poverty) + 1])
      .range([0, chartWidth]);

  // axis functions
    var yAxis = d3.axisLeft(yLinearScale);
    var xAxis = d3.axisBottom(xLinearScale);
    
   // Append Axes to the chart
    
    chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xAxis);

    chartGroup.append("g")
      .call(yAxis);

  // Create the plot circles
    
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("r", "10")
      .attr("opacity", "0.75")
      .attr("class", "stateCircle")
      .attr("stroke", "black");


  // Initialize tool tip
    
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, 0])
      .html(function(d) {
        return (`<strong>${d.state}</br></br>Lacks Healthcare (%):</br>${d.healthcare}</br></br>Poverty (%):</br> ${d.poverty}<strong>`);
      });

  // Create tooltip in the chart
  
    svg.call(toolTip);

  // Create event listeners to display and hide the tooltip
    // mouseclick event
    circlesGroup.on("click", function(data) {
      toolTip.show(data, this);
    });
    // onmouseover event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    });
    // onmouseout event
    circlesGroup.on("mouseout", function(data) {
      toolTip.hide(data, this);
    });

  // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Poverty (%)");

    // State Abbreviation in the Cirles
    chartGroup.append("text")
      .attr("class", "stateText")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .selectAll("tspan")
      .data(censusData)
      .enter()
      .append("tspan")
      .attr("x", function(data) {
          return xLinearScale(data.poverty);
      })
      .attr("y", function(data) {
          return yLinearScale(data.healthcare -0.2);
      })
      .text(function(data) {
          return data.abbr
      });
    
}).catch(function(error) {
  console.log(error);

});