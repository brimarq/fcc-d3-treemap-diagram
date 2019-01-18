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
    .attr("fill", "#999")
  ;

  const textwrap = d3.textwrap()
    .bounds(function() {
      // console.log(this);
      let obj = {height: 100, width: 100}
      return obj;
    })
  ;

  leaves.append("text").text((d) => d.data.name)
    // .attr("textLength", (d) => (d.x1 - d.x0))
    // .attr("lengthAdjust", "spacingAndGlyphs")
    .style("font-size", ".7em")
    // .attr("y", 2)
    // .attr("dy", "1.1em")
    .each(function(d) {
      console.log(this);
      let w = d.x1 - d.x0;
      let h = d.y1 - d.y0;
      let wrap = d3.textwrap().bounds({height: h, width: w}).padding(5);
      d3.select(this).call(wrap);
    })
    // .call(wrap, d3.select("rect.tile").attr("width") - 2)
    // .call(textwrap);
  ;


  
  /** Helper function to wrap svg text 
   * Credit: Mike Bostock
   * http://bl.ocks.org/mbostock/7555321
  */
  function wraps(text, width) {
    text.each(function() {
      // console.log(this);
      let text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

}