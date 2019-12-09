// Data source
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

/************************************
 * JSON request to load data from url
 ************************************/
document.addEventListener('DOMContentLoaded', () => {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      populateHeatMap("#heatMap", data.monthlyVariance, data.baseTemperature);
    })
});

/************************************
 * Creat bar chart from dataset
 ************************************/
populateHeatMap = (id, dataset, baseTemp) => {
  // Define w/h/p ratio
  const w = 1500;
  const h = 500;
  const padding = 80;

  const color = [
    [2, "darkblue"],
    [4, "blue"],
    [6, "lightblue"],
    [8, "lightyellow"],
    [10, "gold"],
    [12, "tomato"],
    [99, "fireBrick"]
  ];

  const colorFormat = (temp) => {
    for (let i = 0; i < color.length; i++)
      if (temp < color[i][0]) return color[i][1];
  }

  const yearFormat = d3.format("");
  const monthFormat = ["Janvier", "Févier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const tempFormat = d3.format(".2f");

  // Define scaling functions
  const xScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
    .range([padding, w - padding]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.month) - 0.5, d3.max(dataset, d => d.month) + 0.5])
    .range([padding, h - padding]);

  // Create SVG layout
  const svg = d3.select(id)
    .append("svg")
    .attr("viewBox", "0 0 " + w + " " + h)

  // Create Axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d => yearFormat(d));
  const yAxis = d3.axisLeft(yScale).tickFormat(d => monthFormat[d - 1]);

  svg.append("g")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis)
    .attr("id", "x-axis");

  svg.append("g")
    .attr("transform", "translate(" + padding + ", 0)")
    .call(yAxis)
    .attr("id", "y-axis");

  // Create bars 
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.year))
    .attr("y", d => yScale(d.month - 0.5))
    .attr("width", (w - 2 * padding) / (d3.max(dataset, d => d.year) - d3.min(dataset, d => d.year)))
    .attr("height", (h - 2 * padding) / 12)
    .attr("class", "cell")
    .attr("data-year", d => d.year)
    .attr("data-month", d => d.month)
    .attr("data-temp", d => baseTemp + d.variance)
    .style("fill", d => colorFormat(baseTemp + d.variance))
    .append("title")
    .attr("id", "tooltip")
    .attr("data-year", d => d.year)
    .text(d => d.year + " - " + d.month + "\n" + tempFormat(baseTemp + d.variance) + "°C\n" + tempFormat(d.variance) + "°C");

  // Create legend 
  svg.append("text")
    .attr("x", d =>  10)
    .attr("y", d => h - padding / 2 + 16)
    .text("Legend :")
    .attr("id", "legend");

  for (let i = 0; i < color.length; i++) {
    svg.append("rect")
      .attr("x", d => padding + i * 21)
      .attr("y", d => h - padding / 2)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", color[i][1]);

    if (i < (color.length - 1)) {
      svg.append("rect")
        .attr("x", d => padding + i * 21 + 20)
        .attr("y", d => h - padding / 2 - 5)
        .attr("width", 1)
        .attr("height", 30);

      svg.append("text")
        .attr("x", d => padding + i * 21 + 13)
        .attr("y", d => h - padding / 2 + 40)
        .text(color[i][0]);
    }
  }
}
