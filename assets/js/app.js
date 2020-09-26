// When the browser window is resized and when the browser loads, 
// makeResponsive() is called
d3.select(window).on("resize", makeResponsive);
makeResponsive();

// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the svg area is not empty when the browser loads,
    // clear it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg if it is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // svg container
    var svgWidth = 960;
    var svgHeight = 500;

    var margin = {
        top: 40,
        right: 40,
        bottom: 80,
        left: 100
    };

    // chart area minus the margins
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // make the svg wrapper, append an svg group that will hold the chart
    // shift everything over
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    
    // Append the svg group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial parameters, choosing poverty and healthcare for this plot
    var XAxis = "poverty";
    var YAxis = "healthcare";

    // function to update x-scale var when there is a click on axis label
    function xScale(demoData, XAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(demoData, d => d[XAxis]) * 0.8,
            d3.max(demoData, d => d[XAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(demoData, YAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(demoData, d => d[YAxis]) * 0.8,
            d3.max(demoData, d => d[YAxis]) * 1.2
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // the function utilized  for updating yAxis var when clicked on the axis label
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    // function for updating circles group when clicking on new axis
    function renderCircles(circlesGroup, newXScale, newYScale, XAxis, YAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[XAxis]))
            .attr("cy", d => newYScale(d[YAxis]));
        return circlesGroup;
    }

    // function used for updating the text in circles group when clicking on new axis
    function renderText(textGroup, newXScale, newYScale, XAxis, YAxis) {
        textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[XAxis]))
            .attr("y", d => newYScale(d[YAxis])+6);
        return textGroup;
    }

    // function to update circles group with new tooltip
    function updateToolTip(XAxis, YAxis, textGroup) {

        if (XAxis === "poverty") {
            var xlabel = "In Poverty:";
        }
        else if (XAxis === "age") {
            var xlabel = "Median Age:";
        }
        else {
            var xlabel = "Median Income:";
        }

        if (YAxis === "healthcare") {
            var ylabel = "Lack Healthcare:";
        }
        else if (YAxis === "smokes") {
            var ylabel = "Smoke";
        }
        else {
            var ylabel = "Obese";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[XAxis]}<br>${ylabel} ${d[YAxis]}%`);
            });

        textGroup.call(toolTip);

        textGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
            // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });

        return textGroup;
    }

    // Import the data
    var file = "assets/data/data.csv"
    d3.csv(file).then(successHandle, errorHandle);

    function errorHandle(error){
        throw err;
    }

    function successHandle(demoData) {

        // parse data as numbers
        demoData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // create the scale functions
        var xLinearScale = xScale(demoData, XAxis);
        var yLinearScale = yScale(demoData, YAxis);

        // create the axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append the axis' to the chart
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // make the circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[XAxis]))
            .attr("cy", d => yLinearScale(d[YAxis]))
            .attr("r", "15")
            .attr("fill", "blue")
            .attr("opacity", ".75");

        var textGroup = chartGroup.selectAll(".label")
            .data(demoData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(function(d) {return d.abbr;})
            .attr("x", d => xLinearScale(d[XAxis]))
            .attr("y", d => yLinearScale(d[YAxis])+6)
            .attr("fill", "white")
            .attr("font-family","sans-serif");


        // make the group for the 3 y-axis labels
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)")
            .attr("class", "axisText")
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle");

        var obesityLabel = ylabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "obesity")
            .classed("inactive", true)
            .attr("dy", "1em")
            .text("Obesity (%)");

        var smokesLabel = ylabelsGroup.append("text")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "smokes")
            .classed("inactive", true)
            .attr("dy", "1em")
            .text("Smoking (%)");

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "healthcare")
            .classed("active", true)
            .attr("dy", "1em")
            .text("Lacks Healthcare (%)");

        // make the group for the 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("Lives In Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");

        // updateToolTip function above csv import
        var textGroup = updateToolTip(XAxis, YAxis, textGroup);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {
            
            var xvalue = d3.select(this).attr("value");
            if (xvalue !== XAxis) {

            // updates
            XAxis = xvalue;

            xLinearScale = xScale(demoData, XAxis);

            xAxis = renderXAxis(xLinearScale, xAxis);

            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, XAxis, YAxis);

            textGroup = renderText(textGroup, xLinearScale, yLinearScale, XAxis, YAxis);

            textGroup = updateToolTip(XAxis, YAxis, textGroup);

            // if statement, changes classes to change bold text
            if (XAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else if (XAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
            }
        });
        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var yvalue = d3.select(this).attr("value");
            if (yvalue !== YAxis) {

            // updates like above but for y axis
            YAxis = yvalue;

            yLinearScale = yScale(demoData, YAxis);

            yAxis = renderYAxis(yLinearScale, yAxis);

            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, XAxis, YAxis);

            textGroup = renderText(textGroup, xLinearScale, yLinearScale, XAxis, YAxis);

            text = updateToolTip(XAxis, YAxis, textGroup);

            // changes classes to change bold text
            if (YAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else if (YAxis === "smokes") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
            }
        });
    }
}