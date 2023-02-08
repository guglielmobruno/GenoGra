import React, { KeyboardEvent, ChangeEvent, FC, useEffect, useState } from "react";
import { useSigma} from "react-sigma-v2";
import { Attributes } from "graphology-types";
import { BsSearch } from "react-icons/bs";
import {sendVision, getVision} from "../my-utils.js";
import Panel from "./Panel"
import axios from 'axios';
import { FiltersState, Meta, Dataset, MetaSet } from "../types";
import FileDownload from 'js-file-download';
import { LocalDateTime } from "neo4j-driver";
import { stringify } from "querystring";

const StatsFilterPanel: FC<{ name: string }> = ({ name }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [filters, setFilters] = useState<{setted: boolean; length: {min: string, max: string}; KC: {min: string, max: string}; GC: {min: string, max:string}; inE: {min: string, max:string}; outE: {min: string, max:string}}>({setted: false, length: {min: '0', max: '-1'}, KC: {min: '0', max: '-1'}, GC: {min: '0', max:'-1'}, inE: {min: '0', max:'-1'}, outE: {min: '0', max:'-1'}})
    const [selected, setSelected] = useState<Array<string>>([]);

    const filter = async (): Promise<any> => {
        setFilters({...filters, setted: !filters.setted})
        if (filters.setted===false) await selectNodes()
    }

    const selectNodes = () => {
        let sel: string[] = []
        graph.forEachNode((key: string, att: Attributes) => {
            const len = att.sequence.length
            const KC = +att.KC?.split(':')[2]/len
            let GC = 0;
            for ( let i=0; i< att.sequence.length; i++) {
                if(att.sequence[i]==='C' || att.sequence[i]==='G' || att.sequence[i]==='c' || att.sequence[i]==='g') GC++;
            }
            GC = GC/len *100
            const inE = graph.inEdges(key).length
            const outE = graph.outEdges(key).length
            if (len >= +filters.length.min && (len <= +filters.length.max || filters.length.max === '-1')){
                if (GC >= +filters.GC.min && (GC <= +filters.GC.max || filters.GC.max === '-1')){
                    if (inE >= +filters.inE.min && (inE <= +filters.inE.max || filters.inE.max === '-1')){
                        if (outE >= +filters.outE.min && (outE <= +filters.outE.max || filters.outE.max === '-1')){      
                            if (KC ){
                                if (KC >= +filters.KC.min && (KC <= +filters.KC.max || filters.KC.max === '-1')){
                                    sel.push(key)
                                }
                            }
                            else {
                                sel.push(key)
                            }
                        }
                    }
                }               
            }
        });
        setSelected(sel)
    }

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
    
        return `#${r.toString(16).toUpperCase()}${g.toString(16).toUpperCase()}${b.toString(16).toUpperCase()}`;
    }
    
    const clearInput = (ids:string[]) =>{
        ids.forEach((id) => {
            (document.getElementById(id) as HTMLInputElement).value='';
        })
       
    }

    useEffect(() => {
        if(filters.setted === true){
            graph.forEachNode((key) => {
                    if (!selected.includes(key)) graph.setNodeAttribute(key, 'hidden', true);
                })
        }else{
            graph.forEachNode((key) => {
                graph.setNodeAttribute(key, 'hidden', false);
            })
        }
    },[selected, filters.setted]);

    return (
        <Panel
        title={
          <>
             Structural filters
          </>
        }
      > 
        <div className="stat_filt">
            {/* <p>{JSON.stringify(filters)}</p>
            <p>{'ciaoooo' + selected}</p> */}
            <h3>Nodes Length</h3>
                <input className='myInp' id="minLen" type="number" placeholder="min" onChange={(e) => setFilters({... filters, length: {...filters.length, min: e.target.value.toString()}})}/>
                <input className='myInp' id="maxLen" type="number" placeholder="max" onChange={(e) => setFilters({... filters, length: {...filters.length, max: e.target.value.toString()}})}/>
                <button className='xbtn' onClick={() => {
                    clearInput(['minLen','maxLen'])
                    setFilters({... filters, length: {min: '0', max: '-1'}})
                }}></button>    
            <h3>Nodes K-mers Counting</h3>
                <input className='myInp' id="minK" type="number" placeholder="min" onChange={(e) => setFilters({... filters, KC: {...filters.KC, min: e.target.value.toString()}})}/>
                <input className='myInp' id="maxK" type="number" placeholder="max" onChange={(e) => setFilters({... filters, KC: {...filters.KC, max: e.target.value.toString()}})}/>
                <button className='xbtn' onClick={() => {
                    clearInput(['minK','maxK'])
                    setFilters({... filters, KC: {min: '0', max: '-1'}})
                }}></button>
            <h3>Nodes GC Content</h3>
                <input className='myInp' id="minGC" type="number" placeholder="min" onChange={(e) => setFilters({... filters, GC: {...filters.GC, min: e.target.value.toString()}})}/>
                <input className='myInp' id="maxGC" type="number" placeholder="max" onChange={(e) => setFilters({... filters, GC: {...filters.GC, max: e.target.value.toString()}})}/>
                <button className='xbtn' onClick={() => {
                    clearInput(['minGC','maxGC'])
                    setFilters({... filters, GC: {min: '0', max: '-1'}})
                }}></button>
            <h3>In Edges</h3>
                <input className='myInp' id="minInE" type="number" placeholder="min" onChange={(e) => setFilters({... filters, inE: {...filters.inE, min: e.target.value.toString()}})}/>
                <input className='myInp' id="maxInE" type="number" placeholder="max" onChange={(e) => setFilters({... filters, inE: {...filters.inE, max: e.target.value.toString()}})}/>
                <button className='xbtn' onClick={() => {
                    clearInput(['minInE','maxInE'])
                    setFilters({... filters, inE: {min: '0', max: '-1'}})
                }}></button>
            <h3>Out Edges</h3>
                <input className='myInp' id="minOutE" type="number" placeholder="min" onChange={(e) => setFilters({... filters, outE: {...filters.outE, min: e.target.value.toString()}})}/>
                <input className='myInp' id="maxOutE" type="number" placeholder="max" onChange={(e) => setFilters({... filters, outE: {...filters.outE, max: e.target.value.toString()}})}/>
                <button className='xbtn' onClick={() => {
                    clearInput(['minOutE','maxOutE'])
                    setFilters({... filters, outE: {min: '0', max: '-1'}})
                }}></button>
                <br />
            <button className="btn" onClick={() => filter()}>Filter</button>
        </div>
       </Panel>
    );
};

export default StatsFilterPanel;

