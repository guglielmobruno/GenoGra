import React, { FC, useEffect, useState } from "react";
import { useSigma } from "react-sigma-v2";

import { FiltersState, Dataset } from "../types";

function prettyPercentage(val: number): string {
  return (val * 100).toFixed(1) + "%";
}

const GraphTitle: FC<{ filters: FiltersState, name: string }> = ({ filters, name }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [visibleItems, setVisibleItems] = useState<{ nodes: number; edges: number }>({ nodes: 0, edges: 0 });
  const [title, setTitle] = useState<string>(name)

  useEffect(() => {
    const fields : {[key:string] : any[] } = {};
    fetch(`${process.env.PUBLIC_URL}/available/${name}`)
        .then((res) => res.json())
        .then((data: Dataset) => {
          setTitle(data.name)
        })}, [])
  useEffect(() => {
    // To ensure the graphology instance has up to data "hidden" values for
    // nodes, we wait for next frame before reindexing. This won't matter in the
    // UX, because of the visible nodes bar width transition.
    requestAnimationFrame(() => {
      const index = { nodes: 0, edges: 0 };
      graph.forEachNode((_, { hidden }) => !hidden && index.nodes++);
      graph.forEachEdge((_, _2, _3, _4, source, target) => !source.hidden && !target.hidden && index.edges++);
      setVisibleItems(index);
    });
  }, [filters]);

  return (
    <div className="graph-title">
      <h1>{title + ' Genome Graph'}</h1>
      {/* <h1>SARS-CoV-2 Genome Graph</h1> */}
      <h2>
        <i>
          {graph.order} node{graph.order > 1 ? "s" : ""}{" "}
          {visibleItems.nodes !== graph.order
            ? ` (only ${prettyPercentage(visibleItems.nodes / graph.order)} visible)`
            : ""}
          , {graph.size} edge 
          {/* , 3654 edge */}
          {graph.size > 1 ? "s" : ""}{" "}
          {visibleItems.edges !== graph.size
            ? ` (only ${prettyPercentage(visibleItems.edges / graph.size)} visible)`
            : ""}
        </i>
      </h2>
    </div>
  );
};

export default GraphTitle;
