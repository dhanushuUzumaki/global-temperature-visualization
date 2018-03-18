const apiUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const tooltip = document.getElementsByClassName('tooltip')[0];

const plot = (data) => {

  const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 100
  };
  const width = Math.max((((window.innerWidth / 100) * 80) - margin.right - margin.left), 500);
  const height = ((window.innerHeight / 100) * 80) - margin.bottom - margin.top;

  const parseTime = d3.timeParse('%M:%S');

  const minTime = d3.min(data, d => d.Seconds);
  const transformedData = data.map(d => {
    d.behindBy = d.Seconds - minTime;
    d.formattedTime = parseTime(d.Time);
    return d;
  })

  console.log(transformedData);

  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const valueLine = d3.line()
    .x(d => x(d.behindBy))
    .y(d => y(d.Place));
  const svg = d3.select('svg')
    .attr('width', width + margin.left + margin.right + 100)
    .attr('height', height + margin.top + margin.bottom + 100)
    .append('g')
    .attr('transform',
      `translate(${margin.left}, ${margin.top})`);

  x.domain(d3.extent(data, d => d.behindBy).reverse());
  y.domain([d3.max(data, d => d.Place), 0]);

  svg.append('path')
    .data([data])
    .attr('class', 'line')
    .attr('d', valueLine);

  svg.selectAll('dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('cx', d => x(d.behindBy))
    .attr('cy', d => y(d.Place))
    .attr('class', 'item')
    .attr('fill', d => {
      return d.Doping === '' ? 'green' : '#ffcc54';
    })
    .on('mouseover', d => {
      tooltip.classList.remove('hidden');
      tooltip.innerHTML = `${d.Name}<br />Time: ${d.Time}<br />Nationality: ${d.Nationality}<br />Doping: ${d.Doping === '' ? 'No Doping allegations' : d.Doping}`;
    })
    .on('mouseout', d => {
      tooltip.classList.add('hidden');
    })

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform',
      `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('.2f')));

  svg.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," +
      (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .attr('class', 'label')
    .text("Behind By (Units in seconds)");

  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr('class', 'label')
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Place");

  svg.append("circle")
    .attr("cx", function (d) {
      return x(10);
    })
    .attr("cy", function (d) {
      return y(20);
    })
    .attr("r", 5)
    .attr("fill", "green");

  svg.append("text")
    .attr("x", function (d) {
      return x(7);
    })
    .attr("y", function (d) {
      return y(20) + 4;
    })
    .attr("class", "legend")
    .text("No doping allegations");

  svg.append("circle")
    .attr("cx", function (d) {
      return x(10);
    })
    .attr("cy", function (d) {
      return y(23);
    })
    .attr("r", 5)
    .attr("fill", "#ffcc54");

  svg.append("text")
    .attr("x", function (d) {
      return x(7);
    })
    .attr("y", function (d) {
      return y(23) + 4;
    })
    .attr("class", "legend")
    .text("Riders with doping allegations");

}

const plotData = (data) => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 100
  };
  const width = Math.max((((window.innerWidth / 100) * 80) - margin.right - margin.left), 700);
  const height = ((window.innerHeight / 100) * 80) - margin.bottom - margin.top;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const colors = ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'];
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleTime().range([0, height]);
  const baseTemp = data.baseTemperature;
  const monthlyVariance = data.monthlyVariance;
  const years = ((year) => year.filter((y, i) => year.indexOf(y) === i))(monthlyVariance.map(mv => mv.year));
  const variances = monthlyVariance.map(mv => mv.variance);
  const gridWidth = width / years.length;
  const gridHeight = height / months.length;
  const legendElementSize = 50;
  const minVariance = d3.min(variances);
  const maxVariance = d3.max(variances);
  const startYear = d3.min(years);
  const endYear = d3.max(years);
  const colorScale = d3.scaleQuantile()
    .domain([minVariance + baseTemp, maxVariance + baseTemp])
    .range(colors);
  x.domain([new Date(startYear, 0), new Date(endYear, 0)]);
  y.domain([new Date(0, 0, 1), new Date(0, 11, 31)]);

  const svg = d3.select('svg')
    .attr('width', width + margin.left + margin.right + 100)
    .attr('height', height + margin.top + margin.bottom + 100)
    .append('g')
    .attr('transform',
      `translate(${margin.left}, ${margin.top})`);

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform',
      `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(20).tickFormat(d3.timeFormat('%Y')));

  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).tickFormat(d3.timeFormat('%B')));

  svg.selectAll('.items')
    .data(monthlyVariance)
    .enter()
    .append('rect')
    .attr('x', d => (d.year - startYear) * gridWidth)
    .attr('y', d => (d.month - 1) * gridHeight)
    .attr('rx', 0)
    .attr('ry', 0)
    .attr('width', gridWidth)
    .attr('height', gridHeight)
    .style('fill', d => colorScale(d.variance + baseTemp))
    .on('mouseover', d => {
      tooltip.classList.remove('hidden');
      tooltip.innerHTML = `${months[d.month-1]}, ${d.year}<br />Temp: ${(d.variance + baseTemp).toFixed(3)} &deg;C<br />Variance: ${d.variance} &deg;C`;
    })
    .on('mouseout', d => {
      tooltip.classList.add('hidden');
    })
    .exit();

  const legend = svg.selectAll(".legend")
    .data([0].concat(colorScale.quantiles()), (d) => d);

  const legend_g = legend.enter().append("g")
    .attr("class", "legend");
  legend_g.append("rect")
    .attr("x", (d, i) => legendElementSize * i)
    .attr("y", height + 40)
    .attr("width", legendElementSize)
    .attr("height", 30)
    .style("fill", (d, i) => colors[i]);

  legend_g.append("text")
    .attr("class", "mono")
    .text((d) => d.toFixed(2))
    .attr("x", (d, i) => legendElementSize * i)
    .attr("y", height + 80 );

  legend.exit();

}

const fetchData = () => {
  return fetch(apiUrl)
    .then(response => {
      return response.json();
    });
};

const fetchAndPlot = async () => {
  try {
    const response = await fetchData();
    plotData(response);
  } catch (e) {
    console.error(e);
  }
}

fetchAndPlot();