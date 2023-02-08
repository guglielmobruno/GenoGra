import React, { KeyboardEvent, ChangeEvent, FC, useEffect, useState } from "react";
import { useSigma} from "react-sigma-v2";
import axios from 'axios';
import { Attributes } from "graphology-types";
import {sendVision, getVision} from "../my-utils.js";
import Panel from "./Panel"
import PanelAlign from "./PanelAlign";

const AlignPanel: FC<{ name: string}> = ({name}) => {
  const [query, setQuery] = useState<string>('')
  const [isAligning, setIsAligning] = useState<string>('none')
  const [alignment, setAlignment] = useState<Array<any>>([])
  
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  function downloadVision() {
    let content = ''
    graph.forEachNode((key, attributes) => {
        if(graph.getNodeAttribute(key,'hidden') === false) {
            content+=`S\t${key}\t${attributes['sequence']}\n`
        }
    })
    graph.forEachEdge((key, attributes) => {
        if(graph.getEdgeAttribute(key,'hidden') === false) {
            content+=`L\t${attributes['source']}\t${attributes['from_sign']==='true'?'-':'+'}\t${attributes['target']}\t${attributes['to_sign']==='true'?'-':'+'}\t*\n`
        }
    })
    return content
  }
  
  const align2 = async (sequence: string, graphname: string) => {
    const gra = downloadVision()
    try {
      const res = await fetch('/api/sendstring', {
        method: 'POST',
        body: JSON.stringify({string: sequence, graph: gra, graphName: graphname}),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      console.log(json)
      setAlignment([json])
      
    } catch (error) {
      console.error(error);
    }
  };

  async function align(sequence: string) {
    setIsAligning('')
    await axios.post('//localhost:5001/demo/align', {seq: sequence})
            .then((e) => {
                console.log('success')
            })
            .catch( (err) => {
                console.error('Error', err)
            })
  }
  

    return(
        <Panel
        title={
          <>
            Alignment
          </>
        }
      >
        <div>
            <div className="lds-roller" style={{display: isAligning}}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            <h3 style={{color: '#90EE90', display: isAligning}}>Loading...</h3>
            <p style={{display: isAligning}}>This process could take a few minutes...</p>
            <div style={{display: isAligning==='none' ? '' : 'none'}}>  
            <input type='file' style={{marginTop:'10px'}}></input>
            <p>or</p>
            <input type='text' style={{marginBottom:'10px', height:'30px', width: '320px'}} placeholder='Insert sequence' onChange={handleChange}></input>
            <br />
            <p>{Date.now()}</p>
            <button className="btn" onClick={(e)=>{
              e.preventDefault()
              align2(query, name)}}>Align</button>
            </div>

            <div style={{overflow: "visible"}}>
                    <ul>{alignment.map((al) =>            
                      <PanelAlign title={
                        <>
                        {'Alignment ' + (alignment.indexOf(al)+1)}
                        </>
                      } file={al} ></PanelAlign>
                    )}</ul>
                  </div>
        </div>
        </Panel>
    )
}

export default AlignPanel;