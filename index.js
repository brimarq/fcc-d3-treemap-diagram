const KICKSTARTER_PLEDGES = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"; 

const MOVIE_SALES = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json";

const VIDEO_GAME_SALES = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";

const dataUrls = [KICKSTARTER_PLEDGES, MOVIE_SALES, VIDEO_GAME_SALES];

let data;

/** Fetch json data, then... */
Promise.all(dataUrls.map(url => d3.json(url)))
  .then((rcvdData) => {
     
    
    data = rcvdData[1];
  })
  .then(() => drawSvg())
;

/** Set properties for the svg element */
const svgProps = {};
svgProps.outerWidth = 1000;
svgProps.outerHeight = svgProps.outerWidth / 1.6; // 16:10 aspect ratio
svgProps.margin = {
  top: svgProps.outerHeight * 0.05, 
  right: svgProps.outerWidth * 0.05, 
  bottom: svgProps.outerHeight * 0.05, 
  left: svgProps.outerWidth * 0.05
};
svgProps.innerWidth = svgProps.outerWidth - svgProps.margin.left - svgProps.margin.right;
svgProps.innerHeight = svgProps.outerHeight - svgProps.margin.top - svgProps.margin.bottom;

function drawSvg() {
  console.log(data);

  /** Create hidden tooltip div */
  const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("background", "hsla(0, 0%, 0%, .8)")
    .style("visibility", "hidden")
    .each(function() {
      d3.select(this).append("span").attr("id", "movie-title");
      d3.select(this).append("span").attr("id", "movie-category");
      d3.select(this).append("span").attr("id", "movie-value");
    })
  ;

  const colors = d3.scaleOrdinal()
    .range(['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69'])
    .domain(data.children.map(x => x.name))
  ;

  const svg = d3.select("main div#svg-container")
    .append("svg")
    .attr("width", svgProps.outerWidth)
    .attr("height", svgProps.outerHeight)
  ;

  const treemap = svg.append("g")
    .attr("id", "treemap-diagram")
    .attr("transform", "translate(" + svgProps.margin.left + ", " + svgProps.margin.top + ")")
  ;

  // Create root node for treemap from hierarchical data
  const root = d3.hierarchy(data)
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

  console.log(root);
  // console.log(treemapLayout(root));
  // categories
  console.log(data.children.map(x => x.name));
  console.log(data);

  console.log(root.leaves());

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

  // const textwrap = d3.textwrap()
  //   .bounds(function() {
  //     // console.log(this);
  //     let obj = {height: 100, width: 100}
  //     return obj;
  //   })
  // ;

  leaves.append("text").text((d) => d.data.name)
    // .attr("textLength", (d) => (d.x1 - d.x0))
    // .attr("lengthAdjust", "spacingAndGlyphs")
    .style("font-size", ".7em")
    // .attr("y", 2)
    // .attr("dy", "1.1em")
    .each(function(d) {
      // console.log(this);
      let w = d.x1 - d.x0;
      let h = d.y1 - d.y0;
      let wrap = d3.textwrap().bounds({height: h, width: w}).padding(5);
      d3.select(this).call(wrap);
    })
    // .call(wrap, d3.select("rect.tile").attr("width") - 2)
    // .call(textwrap);
  ;

  
  treemap.selectAll("div")
    .on("mouseover", function(d) {
      // let dataset = this.dataset 
      let dataset = d.data;
      // name = dataset.name,
      // category = dataset.category,
      // value = dataset.value,
      ;

      d3.select(this).style("outline", "1px solid lime");
      // d3.select(this).attr("stroke", "lime");
      // d3.select(this).attr("stroke-width", 1.5);
      
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
      d3.select(this).style("outline", "none");
      // d3.select(this).attr("stroke", "none");
      tooltip.style("visibility", "hidden");
    })
  ;


  
  /** Helper function to wrap svg text 
   * Credit: Mike Bostock
   * http://bl.ocks.org/mbostock/7555321
  */
  // function wraps(text, width) {
  //   text.each(function() {
  //     // console.log(this);
  //     let text = d3.select(this),
  //         words = text.text().split(/\s+/).reverse(),
  //         word,
  //         line = [],
  //         lineNumber = 0,
  //         lineHeight = 1.1, // ems
  //         y = text.attr("y"),
  //         dy = parseFloat(text.attr("dy")),
  //         tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
  //     while (word = words.pop()) {
  //       line.push(word);
  //       tspan.text(line.join(" "));
  //       if (tspan.node().getComputedTextLength() > width) {
  //         line.pop();
  //         tspan.text(line.join(" "));
  //         line = [word];
  //         tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
  //       }
  //     }
  //   });
  // }

}