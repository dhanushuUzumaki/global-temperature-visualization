const apiUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const tooltip = document.getElementsByClassName('tooltip')[0];

const plot = (data) => {

  const margin = { top: 20, right: 20, bottom: 10, left: 100 };
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

const fetchData = () => {
  return fetch(apiUrl)
    .then(response => {
      return response.json();
    });
};

const fetchAndPlot = async () => {
  try {
    const response = await fetchData();
    plot(response);
  } catch (e) {
    console.error(e);
  }
}

fetchAndPlot();