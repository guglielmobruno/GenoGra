import React, { KeyboardEvent, ChangeEvent, FC, useEffect, useState } from "react";
import { useSigma} from "react-sigma-v2";

import Panel from "./Panel"
import FiltersPanel2 from "./FiltersPanel2";
import StatsFilterPanel from "./StatsFilterPanel";
import { FiltersState} from "../types";


const FiltersPanel: FC<{ filters: FiltersState, name: string }> = ({ filters, name }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    

    return (
        <Panel
        title={
          <>
             Filters
          </>
        }
      > 
        <div style = {{marginTop:'13px'}}>
            <FiltersPanel2 filters={filters} name={name} />
            <StatsFilterPanel name={name} />
        </div>    
       </Panel>
    );
};

export default FiltersPanel;

