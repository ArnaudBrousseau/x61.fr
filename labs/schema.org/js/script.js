var CANVAS_WIDTH = 640,
    GLOBAL_MARGIN =  5,
    TREE_DEPTH = 24,
    TREE_BREADTH = 24,
    ROOT_NAME = "Origin of the world";
    FONT_SIZE = 16, 
    DOT_SIZE = 16;

var root = pv.dom(data)
    .root(ROOT_NAME)
    .sort(function(a, b){ 
      return pv.naturalOrder(a.nodeName, b.nodeName)
    });

var vis = new pv.Panel()
    .canvas('main')
    .width(CANVAS_WIDTH)
    .height(function() {
      return (root.nodes().length + 1) * TREE_BREADTH; 
    })
    .margin(GLOBAL_MARGIN);

var layout = vis.add(pv.Layout.Indent)
    .nodes(function() {
      return root.nodes();
    })
    .depth(TREE_DEPTH)
    .breadth(TREE_BREADTH);

layout.link.add(pv.Line);

var node = layout.node.add(pv.Panel)
    .top(function(n) { 
      return n.y - DOT_SIZE/2;
    })
    .height(DOT_SIZE)
    .right(DOT_SIZE/2)
    .strokeStyle(null); 

node.anchor("left").add(pv.Dot)
    .strokeStyle("#1f77b4")
    .cursor("pointer")
    .event("click",toggle)
    .fillStyle(function(n) {
      if(n.toggled) {     
        return "#1f77b4";
      } else if(n.firstChild) {
        return "#aec7e8";
      } else {
        return "#ff7f0e";
      }
    })
    .anchor("right").add(pv.Label)
    .cursor("pointer")
    .events("all")
    .event("click",toggle)
    .text(function(n) { 
      return n.nodeName;
    })
    .font(FONT_SIZE + "px sans-serif")
    .textStyle("#444");

node.anchor("right").add(pv.Label)
    .textStyle(function(n) {
      if (n.firstChild || n.toggled) {
        return "#444";
      }
      return "#999";
    })
    .text(function(n) {
      if(n.nodeName === ROOT_NAME) { return "schema.org";}
      return "schema.org/" + n.nodeName;
    })
    .url(function(n){
      if(n.nodeName === ROOT_NAME) { return "http://www.schema.org";}
      return "http://schema.org/" + n.nodeName; 
    })
    .cursor("pointer")
    .title("Go to the official page of the entity")
    .events("all")
    .event("mouseover", function(){
      self.status = "Go to schema.org";
    })
    .event("mouseout", function(){ 
      self.status = "";
    })
    .event("click", function(n){ 
      if(n.nodeName === ROOT_NAME) { 
        window.location = "http://www.schema.org";
      } else {
        window.location = "http://schema.org/" + n.nodeName; 
      }
    });

//vis.render();

/* Toggles the selected node, then updates the layout. */
function toggle(n) {
  n.toggle(pv.event.altKey);
  return layout.reset().root;
}

root.visitAfter(function(n) {
  n.toggle();
});

// pv.nodes(function(n){ toggle(n); });
vis.render();

