import React, { FC, useEffect, useRef, useState } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import AnimateHeight from "react-animate-height";
import { useSigma} from "react-sigma-v2";
import { Attributes } from "graphology-types";

const DURATION = 300;
const matchColor = '#00cf72'
const revColor = '#6495ed'

const PanelAlign: FC<{ title: JSX.Element | string; initiallyDeployed?: boolean; file: any;}> = ({
  title,
  initiallyDeployed,
  file,
  children,
}) => {
  const [isDeployed, setIsDeployed] = useState(initiallyDeployed || false);
  const [alignment, setAlignment] = useState<Array<any>>([]);
  const [query, setQuery] = useState<Array<any>>([]);
  const dom = useRef<HTMLDivElement>(null);
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [score, setScore] = useState<string>('')

  const revComp = (seq:string) => {
    var rev='';
    for (let i = seq.length-1; i > -1; i--){
      if (seq[i] === 'A') rev=rev.concat('T')
      else if (seq[i] === 'T') rev=rev.concat('A')
      else if (seq[i] === 'C') rev=rev.concat('G')
      else if (seq[i] === 'G') rev=rev.concat('C')
    }
    return rev;
  }

  useEffect(() => {
    if (isDeployed)
      setTimeout(() => {
        if (dom.current) dom.current.parentElement!.scrollTo({ top: dom.current.offsetTop - 5, behavior: "smooth" });
      }, DURATION);
  }, [isDeployed]);

  // DA SCOMMENTARE PER ALLINEAMENTO
  useEffect(() => {
    if (isDeployed){
      const button = document.getElementById(file.identity)
      // fetch(`${process.env.PUBLIC_URL}/alignment/${file}/alignment_${file}.json`)
      //   .then((res) => res.json())
      //   .then((data: any) => {
      let past='';
      let cont = 0;
      let algn:any=[];
      let qry:any=[];
      let nodes:string[]=[]
      let edges:string[]=[]
        // data.path.mapping.forEach((el : any) => {
      file.path.mapping.forEach((el : any) => {
        nodes.push(el.position.node_id)
        const algnEl = graph.getNodeAttribute(el.position.node_id, 'sequence')//.slice(el.position.offset, Number(el.position.offset) + file.sequence.length )
        // const qryEl = data.sequence.substring(cont, graph.getNodeAttribute(el.position.node_id, 'sequence').length+cont)
        const qryEl = file.sequence.substring(cont, graph.getNodeAttribute(el.position.node_id, 'sequence').length+cont).toUpperCase()||'-'
        let col = matchColor
        if (algnEl === qryEl) col = matchColor
        else if (algnEl === revComp(qryEl)) col = revColor
        else {
          col = '#ff8b1f'
        }
        algn.push({seq: algnEl, color: col})
        qry.push({seq: qryEl, color: col})
        graph.setNodeAttribute(el.position.node_id, 'color', col)
        cont += graph.getNodeAttribute(el.position.node_id, 'sequence').length
        // setScore(data.score)
        setScore(file.score)
        if(past!==''){
          graph.inEdges(el.position.node_id).forEach((eid) => {
            if (graph.getEdgeAttribute(eid, 'source') === past){
              graph.setEdgeAttribute(eid, 'color', col)
              edges.push(eid)
            }
          })
          graph.outEdges(el.position.node_id).forEach((eid) => {
            if (graph.getEdgeAttribute(eid, 'target') === past) {
              graph.setEdgeAttribute(eid, 'color', col)
              edges.push(eid)
              // console.log(col + ' ' + edges)
            }
          })
        }
        past=el.position.node_id;
        //})
        if (button) button.style.backgroundColor = '#A9A9A9';
        graph.forEachNode((key: string, attributes: Attributes) => {
          if(!nodes.includes(key)) graph.setNodeAttribute(key, 'color', '#ccc')
        })
        // console.log(edges)
        graph.forEachEdge((key) =>{
          if(!edges.includes(key)) {
            graph.setEdgeAttribute(key, 'hidden', true)
          }else {
            // console.log(key+ ' '+ graph.getEdgeAttribute(key, 'hidden'))
            graph.setEdgeAttribute(key, 'hidden', false)
            graph.setEdgeAttribute(key, 'color', col)
          }
        })
        setAlignment(algn)
        setQuery(qry)
      })
      if (nodes.length === 1){
        console.log('allineamento su un solo nodo')
      } 
  }else{
    const button = document.getElementById(file)
    if (button) button.style.backgroundColor = '#696969';
    setAlignment([])
    graph.forEachNode((key: string, attributes: Attributes) => {
      graph.setNodeAttribute(key, 'color', graph.getNodeAttribute(key, 'originalcolor'))
    })
    graph.forEachEdge((key) =>{
      graph.setEdgeAttribute(key,'color', graph.getEdgeAttribute(key, 'originalcolor'))
      graph.setEdgeAttribute(key, 'hidden', false)
  })
  }
  }, [isDeployed]);

  return (
    <label  className="form-label2">
    <div id={file.identity} className="panel_al" ref={dom} style={{border:'solid white 1px', backgroundColor: "#293133"}}>
      
      <h2 style={{fontFamily:'sans-serif'}}>
        {title}{" "}
        <button  type="button" onClick={() => {
          setIsDeployed((v) => !v)}}>
          {isDeployed ? <MdExpandLess /> : <MdExpandMore />}
        </button>
       
      </h2>
      
      <AnimateHeight duration={DURATION} height={isDeployed ? "auto" : 0}>
        {children}
        <h3 style={{color: 'white'}}>{'Score: ' + score}</h3>
        {/* <div style={{backgroundColor:'#ff467e'}}>{alignment}</div> */}
        <div className="container-align">
          <ul className="parent-align">{alignment.map((el) => {
            return <div style={{backgroundColor:el.color}}>{el.seq}</div>})}
          </ul>
          <br />
          <ul className="parent-align">{query.map((el) => {
            return <div style={{backgroundColor:el.color}}>{el.seq}</div>})}
          </ul>
        </div>  
      </AnimateHeight>
    </div>
    </label>
  );
};

export default PanelAlign;
