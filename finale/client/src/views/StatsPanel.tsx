import React, { FC, useEffect, useRef, useState } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import AnimateHeight from "react-animate-height";
import { useSigma} from "react-sigma-v2";
import { Attributes } from "graphology-types";

const DURATION = 300;

const StatsPanel: FC<{ title: JSX.Element | string; initiallyDeployed?: boolean;}> = ({
    title,
    initiallyDeployed,
    children,
    }) => {
    const [isDeployed, setIsDeployed] = useState(initiallyDeployed || false);
    const dom = useRef<HTMLDivElement>(null);
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [score, setScore] = useState<string>('')
    const [nNodes, setNNodes] = useState<string>('')
    const [nEdges, setNEdges] = useState<string>('')
    const [outDegree, setOutDegree] = useState<string>('')
    const [inDegree, setInDegree] = useState<string>('')
    const [length, setLength] = useState<string>('')
    const [lengthTot, setLengthTot] = useState<string>('')
    const [longNode, setLongNode] = useState<string>('')
    const [KC, setKC] = useState<string>('')
    const [GC, setGC] = useState<string>('')


    useEffect(() => {
        if (isDeployed)
            setTimeout(() => {
                if (dom.current) dom.current.parentElement!.scrollTo({ top: dom.current.offsetTop - 5, behavior: "smooth" });
            }, DURATION);
    }, [isDeployed]);

    useEffect(() => {
        if (isDeployed){
            let nodes:number=0;
            let indeg:number=0;
            let outdeg:number=0;
            let edges:number=0;
            let len:number=0;
            let long:string='';
            let max:number=0;
            let gc:number=0;
            let kc:number=0;
            graph.forEachNode((key: string, attributes: Attributes) => {
                if (!attributes.hidden || attributes.hidden === false) {
                    nodes++;
                    if (graph.outEdges(key).length){
                        graph.outEdges(key).forEach((id) => {
                            if (graph.getEdgeAttribute(id, 'hidden') !== true) outdeg+=1
                        })
                    }
                    // outdeg+=graph.outEdges(key)?.length;
                    indeg+=graph.outEdges(key)?.length;
                    len+=attributes.sequence.length;
                    if (attributes.sequence.length > max){
                        max = attributes.sequence.length;
                        long=key;
                    }
                    if (attributes.KC) kc+= +attributes.KC.split(':')[2]/attributes.sequence.length
                    let tmp = 0;
                    for ( let i=0; i< attributes.sequence.length; i++) {
                        if(attributes.sequence[i]==='C' || attributes.sequence[i]==='G' || attributes.sequence[i]==='c' || attributes.sequence[i]==='g') tmp++;
                    }
                    gc+=tmp/attributes.sequence.length;
                }
            })
            graph.forEachEdge((key: string, attributes: Attributes) => {
                if (graph.getNodeAttribute(attributes.source, 'hidden') === false && graph.getNodeAttribute(attributes.target, 'hidden') === false) edges++;
            })
            setNNodes(nodes.toString())
            setNEdges(edges.toString())
            setInDegree((indeg/nodes).toString())
            setOutDegree((outdeg/nodes).toFixed(2).toString())
            setLength((len/nodes).toFixed(2).toString())
            setLengthTot(len.toString())
            setLongNode(long.toString())
            setKC((kc/nodes).toFixed(2).toString())
            setGC(((gc/nodes)*100).toFixed(2).toString()+'%')
        }
    }, [isDeployed]);
    

    return (
        //<label  className="form-label2">
            <div className="panel" ref={dom} style={{border:'solid white 1px'}}>
                <h2>
                    {title}{" "}
                    <button  type="button" onClick={() => setIsDeployed((v) => !v)}>
                        {isDeployed ? <MdExpandLess /> : <MdExpandMore />}
                    </button>
                </h2>
                <AnimateHeight duration={DURATION} height={isDeployed ? "auto" : 0}>
                    {children}
                    <table className='stat'>
                        <tr>
                            <th>Nodes:</th>
                            <th>{nNodes}</th>
                        </tr>
                        <tr>
                            <th>Edges: </th>
                            <th>{nEdges}</th>
                        </tr>
                        <tr>
                            <th>Average degree: </th>
                            <th>{outDegree}</th>
                        </tr>
                        <tr>
                            <th>Average length: </th>
                            <th>{length}</th>
                        </tr>
                        <tr>
                            <th>Total length: </th>
                            <th>{lengthTot}</th>
                        </tr>
                        <tr>
                            <th>Longest node: </th>
                            <th>{longNode}</th>
                        </tr>
                        <tr>
                            <th>K-mers Counting: </th>
                            <th>{KC}</th>
                        </tr>
                        <tr>
                            <th>GC content: </th>
                            <th>{GC}</th>
                        </tr>
                    </table>
                    
                </AnimateHeight>
            </div>
       // </label>
    );
};  

export default StatsPanel;
