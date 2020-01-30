function drawChart(data){
  const chartSvg = d3.select("#chart")
  const width = chartSvg.node().getBoundingClientRect().width
  const height = width / 2
  const margin = {
    top: width * 2 / 50,
    right: width * 1 / 50,
    bottom: width * 3 / 50,
    left: width * 2 / 50
  }

  line = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => x(d.date))
    .y(d => y(d.value))

  x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right])

  y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height - margin.bottom, margin.top])

  xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

  yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
    .attr("x", 3)
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text(data.y))
        
  chartSvg.selectAll("*").remove()
  chartSvg.attr("viewBox", [0, 0, width, height])
        
  chartSvg.append("g")
    .call(xAxis)
        
  chartSvg.append("g")
    .call(yAxis)
        
  chartSvg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "darkcyan")
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line)
}

// // excluded becouse it becomes very slow
// function drawTable(data, type){
//   const table = d3.select("#table")

//   const headers = [
//     {head: 'Date', class: 'date'},
//     {head: 'Price', class: 'price'}
//   ]
//   const format = {
//     daily: d3.timeFormat('%d.%m.%Y'),
//     weekly: d3.timeFormat('%V %Y'),
//     monthly: d3.timeFormat('%b %Y'),
//     annual: d3.timeFormat('%Y'),
//     price: d3.format(".2f")
//   }

//   table.selectAll("*").remove()

//   // write table headers
//   table.append('thead')
//     .append('tr')
//     .selectAll('th')
//     .data(headers).enter()
//     .append('th')
//     .attr('class', d => d.class)
//     .text(d => d.head)
  
//   // write table body
//   table.append('tbody')
//     .selectAll('tr')
//     .data(data)
//     .enter()
//       .append('tr')
//       .selectAll('td')
//       .data((d) => [d.date, d.value])
//       .enter()
//         .append('td')
//         .text((d, i) => {
//           return (i === 0) ? format[type](d) : format.price(d) + ' $'
//         })
// }

async function showData(type){
  const data = await d3.csv('./data/' + type + '-prices.csv', (d) => ({
      date: new Date(d.Date),
      value: parseFloat(d.Price)
    })
  )
  data.y = '$ / Million Btu'

  drawChart(data)
  // drawTable(data, type)
  
  d3.select('#periods').selectAll("*").classed('active', false)
  d3.select('#' + type).classed('active', true)
}

showData('daily')
