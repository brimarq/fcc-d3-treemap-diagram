const KICKSTARTER_PLEDGES = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"; 

const MOVIE_SALES = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json";

const VIDEO_GAME_SALES = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";

const dataUrls = [KICKSTARTER_PLEDGES, MOVIE_SALES, VIDEO_GAME_SALES];

let data = {};

/** Fetch json data, then draw svg */
Promise.all(dataUrls.map(url => d3.json(url)))
  .then((rcvdData) => {
    data.ksPledges = rcvdData[0];
    data.movieSales = rcvdData[1];
    data.vgameSales = rcvdData[2];
  })
  .then(() => drawSvg())
;

function drawSvg() {

  /** Set properties for the svg element */
  const svgProps = {};
  svgProps.outerWidth = 1000;
  svgProps.outerHeight = svgProps.outerWidth / 1.6; // 16:10 aspect ratio
  svgProps.margin = {
    top: svgProps.outerHeight * 0.10, 
    right: svgProps.outerWidth * 0.03, 
    bottom: svgProps.outerHeight * 0.08, 
    left: svgProps.outerWidth * 0.03
  };
  svgProps.innerWidth = svgProps.outerWidth - svgProps.margin.left - svgProps.margin.right;
  svgProps.innerHeight = svgProps.outerHeight - svgProps.margin.top - svgProps.margin.bottom;
  svgProps.title = {
    x: svgProps.outerWidth / 2,
    y: svgProps.margin.top / 2,
    text1: "Movie Sales",
    text2: "Top 95 Highest Grossing Movies",
    color: "#222"
  };
  svgProps.categories = data.movieSales.children.map(x => x.name);
  svgProps.categoryColors = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494'];
  svgProps.legend = {
    x: svgProps.margin.left,
    y: svgProps.outerHeight - (svgProps.margin.bottom / 1.5),
    itemWidth: svgProps.innerWidth / svgProps.categories.length,
    squareSize: 15
  };

  /** Create hidden tooltip div */
  const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("background", "hsla(0, 0%, 0%, .7)")
    .style("visibility", "hidden")
    .each(function() {
      d3.select(this).append("span").attr("id", "movie-title");
      d3.select(this).append("span").attr("id", "movie-category");
      d3.select(this).append("span").attr("id", "movie-value");
    })
  ;

  // Color scale for categories
  const colors = d3.scaleOrdinal()
    .range(svgProps.categoryColors)
    .domain(svgProps.categories)
  ;

  const svg = d3.select("main div#svg-container")
    .append("svg")
    .attr("width", svgProps.outerWidth)
    .attr("height", svgProps.outerHeight)
  ;

  /** svg title text */
  const titleGroup = svg.append("g")
    .attr("id", "title-group")
    .attr("transform", "translate(" + svgProps.title.x + ", " + svgProps.title.y + ")")
    .style("text-anchor", "middle")
  ;
  titleGroup.append("text")
    .attr("id", "title")
    .attr("fill", svgProps.title.color)
    .style("font-size", "1.25em")
    .style("font-weight", "bold")
    .text(svgProps.title.text1)
  ;
  titleGroup.append("text")
    .attr("id", "description")
    .attr("dy", "1.25em")
    .attr("fill", svgProps.title.color)
    .style("font-weight", "normal")
    .style("font-size", ".8em")
    .text(svgProps.title.text2)
  ;

  // Create group to hold treemap
  const treemap = svg.append("g")
    .attr("id", "treemap-diagram")
    .attr("transform", "translate(" + svgProps.margin.left + ", " + svgProps.margin.top + ")")
  ;

  // Create root node for treemap from hierarchical data
  const root = d3.hierarchy(data.movieSales)
    .sum((d) => d.value)
    // Sort nodes by descending value
    .sort((a, b) => (b.value - a.value))
  ;

  // Create treemap layout with size and padding
  const treemapLayout = d3.treemap()
    .size([svgProps.innerWidth, svgProps.innerHeight])
    .paddingInner(1)
  ;

  /** Transform the root hierarchy into a treemap, adding the 
   * following properties on root and its descendants: 
   *    node.x0 - the left edge of the rectangle
   *    node.y0 - the top edge of the rectangle
   *    node.x1 - the right edge of the rectangle
   *    node.y1 - the bottom edge of the rectangle
   */
  treemapLayout(root);

  // Draw leaves to the treemap
  const leaves = treemap.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
      .attr("class", "leaf")
      .attr("transform", (d) => {
        return "translate(" + d.x0 + ", " + d.y0 + ")";
    })
  ;

  // Append rect tiles to leaves
  leaves.append("rect")
    .attr("class", "tile")
    .attr("width", (d) => (d.x1 - d.x0))
    .attr("height", (d) => (d.y1 - d.y0))
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("fill", (d) => colors(d.data.category))
  ;

  /** Append movie name text to each leaf. 
   * Uses d3.textwrap  https://github.com/vijithassar/d3-textwrap to 
   * automatically wrap text by using foreignObject and divs in svg or 
   * tspans as a fallback if there is no browser support for the former.
   * */
  leaves.append("text").text((d) => d.data.name)
    .style("font-size", ".7em")
    .each(function(d) {
      // console.log(this);
      let w = d.x1 - d.x0;
      let h = d.y1 - d.y0;
      let wrap = d3.textwrap().bounds({height: h, width: w}).padding(5)
        // .method('tspans')
      ;
      d3.select(this).call(wrap);
    })
  ;
  
  // Add event listeners and adjust tspans in case of textwrap fallback
  leaves
    .on("mouseover", function(d) {
      let dataset = d.data;
  
      d3.select(this).select('rect')
        // .style("outline", "2px solid white")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
      ;
      
      tooltip
        .style("visibility", "visible")
        .attr("data-value", dataset.value)
        .each(function() {
          d3.select("#movie-title").text(dataset.name).style("font-weight", "bold");
          d3.select("#movie-category").text(dataset.category).style("font-style", "oblique");
          d3.select("#movie-value").text(d3.format("$,")(dataset.value));
        })
      ;
    })
    .on("mousemove", function(d) { 
      tooltip
        .style("top", (d3.event.pageY - 70) + "px")
        .style("left", (d3.event.pageX + 20) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).select('rect')
        // .style("outline", "none")
        .attr("stroke", "none")
      ;

      tooltip.style("visibility", "hidden");
    })
    // If fallback tspans are used, adjust tspans down, within the rect
    .select('text tspan').attr('dy', '1em')
  ;

  // Create legend
  const legend = svg.append("g")
    .attr("id", "legend")
  ;

  // Add legend item groups with category data
  legend.selectAll('g')
    .data(svgProps.categories)
    .enter().append('g')
      .attr("class", "legend-item-group")
      .attr("transform", (d, i) => {
        let x = i * svgProps.legend.itemWidth, y = 0;
        return "translate(" + x + ", " + y + ")"
      })
  ;

  // Append rects for the category colors
  legend.selectAll('g.legend-item-group').append('rect')
    .attr("class", "legend-item")
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', svgProps.legend.squareSize)
    .attr('width', svgProps.legend.squareSize)
    .attr('fill', (d) => colors(d))
  ;

  // Add text showing category types
  legend.selectAll('g.legend-item-group').append('text')
    .attr("class", "legend-item-text")
    .attr('x', svgProps.legend.squareSize + 4)
    .attr('y', "1em")
    .style('font-size', ".8em")
    .text((d) => d)
  ;

  // Position legend
  legend.attr('transform', () => {
    let legendW = legend.node().getBBox().width, 
    legendX = ((svgProps.innerWidth - legendW) / 2) + svgProps.margin.left;
    return "translate(" + legendX + ", " + svgProps.legend.y + ")";
  });

}