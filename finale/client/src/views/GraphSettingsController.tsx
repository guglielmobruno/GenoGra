import { useSigma } from "react-sigma-v2";
import { FC, useEffect, useState } from "react";

import { drawHover } from "../canvas-utilsE";
import { drawClick } from "../canvas-utilsE";

import useDebounce from "../use-debounce";

const NODE_FADE_COLOR = "#bbb";
const EDGE_FADE_COLOR = "#eee";

const GraphSettingsController: FC<{ hoveredNode: string | null }> = ({ children, hoveredNode }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph(); 
  const [clicked, setClicked] = useState('')
  const [att, setAtt] = useState({})
  const [content, setContent] = useState([''])

  // Here we debounce the value to avoid having too much highlights refresh when
  // moving the mouse over the graph:
  const debouncedHoveredNode = useDebounce(hoveredNode, 40);

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  sigma.getMouseCaptor().on('click', () =>{
      setClicked(hoveredNode || '')
      // drawClick(context, { ...sigma.getNodeDisplayData(hoveredNode), ...data }, setting)
    });
   

  useEffect(() => {
    sigma.setSetting("hoverRenderer", (context, data, settings) =>
      drawHover(context, { ...sigma.getNodeDisplayData(data.key), ...data }, settings),
    );
  }, [sigma, graph]);

  useEffect(() => {
    if (clicked !== null && clicked !==''){
      let text =['']

      //for (const prop in graph.getNodeAttributes(clicked)){
      for(const [prop, value] of Object.entries(graph.getNodeAttributes(clicked))){
        // if( prop === 'tag' || prop === 'key' || (prop === 'sample' && graph.getNodeAttributes(clicked)[prop].length)) text.push(`${prop}: ${graph.getNodeAttributes(clicked)[prop]}\n`)
        if( prop === 'tag' || prop === 'key' || (prop === 'sample' && value.length)) text.push(`${prop}: ${value}\n`)
        if (prop === 'sequence') {
          const lilSeq = value.length>=109 ? value.substring(0,109) : value 
          // const len = graph.getNodeAttribute(clicked, 'sequence').length
          // const seq = graph.getNodeAttribute(clicked, 'sequence')
          const len = value.length
          const seq = value
          text.push(`length: ${len}`)
          let GC = 0;
            for ( let i=0; i< seq.length; i++) {
                if(seq[i]==='C' || seq[i]==='G' || seq[i]==='c' || seq[i]==='g') GC++;
            }
            GC = Math.round(GC/len *10000)/100
            text.push(`GC content: ${GC}%`)
            text.push(`${prop}: ${lilSeq}\n`)
        }if ( prop === 'KC') {
          // const KC = graph.getNodeAttribute(clicked, 'KC')
          const len = graph.getNodeAttribute(clicked, 'sequence').length
          const KC = value
          text.push(`K-mers Counting: ${Math.round(+KC.split(':')[2]/len*100)/100}%`)
        }
      }
      if(graph.inNeighbors(clicked).length){
        text.push(`In-neighbors: ${graph.inNeighbors(clicked)}`)
      }
      if(graph.outNeighbors(clicked).length){
        text.push(`Out-neighbors: ${graph.outNeighbors(clicked)}`)
      }

      setContent(text)
      // setAtt(graph.getNodeAttributes(clicked))
    }
  },[clicked])
  // useEffect(() => {
  //   sigma.setSetting("hoverRenderer", (context, data, settings) =>
  //     drawClick(context, { ...sigma.getNodeDisplayData(data.key), ...data }, settings),
  //   );
  // }, [sigma, graph]);

  /**
   * Update node and edge reducers when a node is hovered, to highlight its
   * neighborhood:
   */
  useEffect(() => {
    const hoveredColor: string = debouncedHoveredNode ? sigma.getNodeDisplayData(debouncedHoveredNode)!.color : "";

    sigma.setSetting(
      "nodeReducer",
      debouncedHoveredNode
        ? (node, data) =>
            node === debouncedHoveredNode ||
            graph.hasEdge(node, debouncedHoveredNode) ||
            graph.hasEdge(debouncedHoveredNode, node)
              ? { ...data, zIndex: 1 }
              : { ...data, zIndex: 0, label: "", color: NODE_FADE_COLOR, image: null, highlighted: false }
        : null,
    );
    sigma.setSetting(
      "edgeReducer",
      debouncedHoveredNode
        ? (edge, data) =>
            graph.hasExtremity(edge, debouncedHoveredNode)
              ? { ...data, color: hoveredColor, size: 4 }
              : { ...data, color: EDGE_FADE_COLOR, hidden: true }
        : null,
    );
  }, [debouncedHoveredNode]);

  return( <div className="panel_node" style = {{display: clicked==='' ? 'none' : 'block' }}>
  {content.map((el) => {
    return (
      <div>
        <p>{el}</p>
      </div>
    )
  })}
  <>{children}</>
  </div>);
};

export default GraphSettingsController;
