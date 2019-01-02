const KICKSTARTER_PLEDGES = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"; 

const MOVIE_SALES = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json";

const VIDEO_GAME_SALES = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";

const dataUrls = [KICKSTARTER_PLEDGES, MOVIE_SALES, VIDEO_GAME_SALES];

let data;

/** Fetch json data, then... */
Promise.all(dataUrls.map(url => d3.json(url)))
  .then((rcvdData) => {
     
    
    data = rcvdData;
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

}