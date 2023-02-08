import { useSigma } from "react-sigma-v2";
import { FC, useEffect, useState } from "react";
import { keyBy, omit } from "lodash";
import { Attributes } from "graphology-types";
import { MultiDirectedGraph } from "graphology";
import { searchSample } from "../canvas-utils"
import { Dataset, FiltersState } from "../types";
import forceAtlas2 from "graphology-layout-forceatlas2";
                
const GraphDataController: FC<{ dataset: Dataset; filters: FiltersState }> = ({ dataset, filters, children }) => {
  const colorList = ['283b5e',]
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [mess, setMess] = useState<string>('');
  let maxKC = -1;
  let minKC = 1000000000;
  /**
   * Feed graphology with the new dataset:
   */
  function adjust(hexInput: string, percent: number) {
    let hex = hexInput;

    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, "");

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, "$1$1");
    }

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    const calculatedPercent = (100 + percent) / 100;

    r = Math.round(Math.min(255, Math.max(0, r * calculatedPercent)));
    g = Math.round(Math.min(255, Math.max(0, g * calculatedPercent)));
    b = Math.round(Math.min(255, Math.max(0, b * calculatedPercent)));

    return `#${r.toString(16).toUpperCase()}${g.toString(16).toUpperCase()}${b
        .toString(16)
        .toUpperCase()}`;
}

  useEffect(() => {
    if (!graph || !dataset) return;

    const clusters = keyBy(dataset.clusters, "key");
    const tags = dataset.tags ? keyBy(dataset.tags, "key") : {};

    dataset.nodes.forEach((node) =>
      graph.addNode(node.key, {
        ...node,
        ...omit(tags[node.tag], "key"),
        ...omit(clusters[node.cluster], "key")
        //image: `${process.env.PUBLIC_URL}/images/${tags[node.tag].image}`,
      }),
    );
     
    graph.forEachNode((key: string, attributes: Attributes) => {
      const size =  attributes.sequence.length;
      const KC = attributes.KC ? attributes.KC.split(':')[2]/size : 'none';
      if (KC!== 'none' && KC < minKC) minKC = KC;
      if (KC!== 'none' && KC > maxKC) maxKC = KC;
    })
    graph.forEachNode((key: string, attributes: Attributes) => {
      const size =  attributes.sequence.length;
      if(attributes.color){
        const color = attributes.color;
        graph.setNodeAttribute(key, 'color', color);
        graph.setNodeAttribute(key, 'originalcolor', color);
      } 
      if(attributes.KC){
        const KC = attributes.KC.split(':')[2]/size;
        const adj = -20 + (KC - minKC)*1000/(maxKC - minKC)
        // if (adjust('6495ED',adj)==='#FFFFFF') console.log(key + KC+ ' '+adjust('6495ED',adj))
        const col = (adjust('6495ED',adj)!=='#FFFFFF') ? adjust('6495ED',adj) : '#e6e6e6';
        graph.setNodeAttribute(key, 'color', col);
        graph.setNodeAttribute(key, 'originalcolor', col);
      }
       
    })
    sigma.refresh()
    
    let edges: string[] = []
    //dataset.edges.forEach(([source, target, from_sign, to_sign, ref, sample]) => {
    dataset.edges.forEach(([source, target, ref, sample, from_sign, to_sign]) => {
      if(edges && edges.length && edges.includes((source+target).toString())){
        // console.log('azz')
      }else{
      const edge = graph.addEdge(source, target, {size: 1 });
      graph.setEdgeAttribute(edge, "source", source );
      graph.setEdgeAttribute(edge, "target", target );
      if (ref) graph.setEdgeAttribute(edge, "is_ref", ref );
      graph.setEdgeAttribute(edge, "color", '#c3c3c3' );
      graph.setEdgeAttribute(edge, "originalcolor", '#c3c3c3' );
      graph.setEdgeAttribute(edge, "from_sign", from_sign );
      graph.setEdgeAttribute(edge, "hidden", false );
      graph.setEdgeAttribute(edge, "to_sign", to_sign ); 
      if (sample) graph.setEdgeAttribute(edge, "sample", sample );
      // console.log('si')
      edges.push((source+target).toString())
      }
    });
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, { settings, iterations: 1000 });
    
    // Use degrees as node sizes:
    let maxSize = 0;
    let minSize = 1000000000;
    graph.forEachNode((node) => {
      const size = graph.getNodeAttribute(node, 'sequence').length
      if (size < minSize) minSize = size;
      if (size > maxSize) maxSize = size;
    })
    graph.forEachNode((node) => {
      const size = graph.getNodeAttribute(node, 'sequence').length
       graph.setNodeAttribute(node, "size", 5 )//+ (size - minSize)*20/(maxSize - minSize))
      // const adj =  5 + (size - minSize)*20/(maxSize - minSize)
      // graph.setNodeAttribute(node, 'color', adjust('6495ED',adj) || '#6495ED');
    });  
    sigma.refresh()
    return () => graph.clear();
  }, [graph, dataset]);

  /**
   * Apply filters to graphology:
   */

  // useEffect(() => {
  //   const { clusters, tags } = filters;
  //   graph.forEachNode((node, { cluster, tag }) =>
  //     graph.setNodeAttribute(node, "hidden", !clusters[cluster] || !tags[tag]),
  //   );
  // }, [graph, filters]);

  return <div>
    <>{children}</>
  </div>;
};

 

export default GraphDataController;
