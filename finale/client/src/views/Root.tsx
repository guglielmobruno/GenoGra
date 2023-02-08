import React, { FC, useEffect, useState } from "react";
import { SigmaContainer, ZoomControl, FullScreenControl } from "react-sigma-v2";
import { omit, mapValues, keyBy, constant } from "lodash";
import { MultiDirectedGraph } from "graphology";

import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

//import App from './App'
import GraphSettingsController from "./GraphSettingsController";
import GraphEventsController from "./GraphEventsController";
import GraphDataController from "./GraphDataController";
import { Dataset, FiltersState } from "../types";
import SearchField from "./SearchField";
import drawLabel from "../canvas-utils";
import GraphTitle from "./GraphTitle";
import TagsPanel from "./TagsPanel";
import SampleSearch from "./SampleSearch"
import FileUploader from "./FileUploader";
import FiltersPanel from "./FiltersPanel";
import AlignPanel from "./AlignPanel";
import StatsPanel from "./StatsPanel";
import Panel from "./Panel";
import App from "./App";
import PanelAlign from "./PanelAlign"

import "react-sigma-v2/lib/react-sigma-v2.css";
import { GrClose } from "react-icons/gr";
import { BiRadioCircleMarked, BiBookContent } from "react-icons/bi";
import { BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut } from "react-icons/bs";
import { Link } from "react-router-dom";

const Root: FC <{name: string}> = ({name}) => {
  const [showContents, setShowContents] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [alignment, setAlignment] = useState<Array<string>>(['alignment.json', 'alignment2.json', 'alignment3.json']);
  const [file, setFile] = useState('datafinale.json')
  const [clicked, setClicked] = useState()
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Load data on mount:
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/available/${name}`)
      .then((res) => res.json())
      .then((dataset: Dataset) => {
        setDataset(dataset);
        setFiltersState({
          clusters: mapValues(keyBy(dataset.clusters, "key"), constant(true)),
          tags: mapValues(keyBy(dataset.tags, "key"), constant(true)),
        });
        requestAnimationFrame(() => setDataReady(true));
      });
  }, []);

  if (!dataset) return null;

  return (
    <div id="app-root" className={showContents ? "show-contents" : ""}>
      <SigmaContainer
        graphOptions={{ type: "directed" }}
        initialSettings={{
          nodeProgramClasses: { image: getNodeProgramImage() },
          labelRenderer: drawLabel,
          defaultNodeType: "image",
          defaultEdgeType: "arrow",
          labelDensity: 0.07,
          labelGridCellSize: 60,
          labelRenderedSizeThreshold: 50,
          labelFont: "Lato, sans-serif",
          zIndex: true,
        }}
        className="react-sigma"
      >
        <GraphSettingsController hoveredNode={hoveredNode} />
        <GraphDataController dataset={dataset} filters={filtersState} /> 
        <GraphEventsController setHoveredNode={setHoveredNode} /> 

        {/* <GraphSettingsController hoveredNode={hoveredNode} /> */}
        
        {/* <GraphDataController dataset={dataset} filters={filtersState} /> */}

        {dataReady && (
          <>
            <div className="controls">
              <div className="ico">
                <button
                  type="button"
                  className="show-contents"
                  onClick={() => setShowContents(true)}
                  title="Show caption and description"
                >
                  <BiBookContent />
                </button>
              </div>
              <FullScreenControl
                className="ico"
                customEnterFullScreen={<BsArrowsFullscreen />}
                customExitFullScreen={<BsFullscreenExit />}
              />
              <ZoomControl
                className="ico"
                customZoomIn={<BsZoomIn />}
                customZoomOut={<BsZoomOut />}
                customZoomCenter={<BiRadioCircleMarked />}
              />
            </div>
            <div className="contents">
              <div className="ico">
                <button
                  type="button"
                  className="ico hide-contents"
                  onClick={() => setShowContents(false)}
                  title="Show caption and description"
                >
                  <GrClose />
                </button>
              </div>
              <GraphTitle filters={filtersState} name={name}/>
              <div className="panels_stat">
              <Link to="/" >Home</Link>
                <StatsPanel title={
            <>
              {'Metrics '}
            </>
            
          }> </StatsPanel>
              </div>
              
              <div className="panels">

                <SearchField filters={filtersState} />
                <SampleSearch filters={filtersState} /> 
                <FiltersPanel filters={filtersState} name={name}/>
                <AlignPanel name={name}/>
                {/* <Panel title={
                  <>
                  Alignment
                  </>
                }> 
                  <div style={{overflow: "visible"}}>
                    <ul>{alignment.map((al) =>            
                      <PanelAlign title={
                        <>
                        {'Alignment ' + (alignment.indexOf(al)+1)}
                        </>
                      } file={al}></PanelAlign>
                    )}</ul>
                  </div>
                </Panel>     */}
              </div>
              {/* <div className="panels_al">
                <Panel title={
                  <>Alignment</>
                }> 
                  <div style={{overflow: "visible"}}>
                    <ul>{alignment.map((al) =>            
                      <PanelAlign title={
                        <>{'Alignment ' + (alignment.indexOf(al)+1)}</>
                      } file={al}></PanelAlign>
                    )}</ul>
                  </div>
                </Panel> 
              </div> */}
            </div>
          </>
        )}
      </SigmaContainer>
    </div>
  );
};

export default Root;
