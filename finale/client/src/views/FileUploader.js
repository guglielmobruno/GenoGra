import React, {useEffect, useState} from "react";
import axios from 'axios';
import {Link} from "react-router-dom";
import FileDownload from 'js-file-download';
import { convertCompilerOptionsFromJson, textChangeRangeIsUnchanged } from "typescript";
import { BsFileBarGraphFill } from "react-icons/bs";
function FileUploader (params) {
    const [available, setAvailable] = useState(['sars_cov2','sars_cov3']);

    const [fileRef, setFileRef] = useState(null);
    const [fileMut, setFileMut] = useState(null);
    const [fileMeta, setFileMeta] = useState(null);
    const [fileGFA, setFileGFA] = useState(null);
    const [graphType, setGraphType] = useState('')
    const [graphName, setGraphName] = useState('');
    const [hidden, setHidden] = useState('hidden');
    const [availableHidden, setAvailableHidden] = useState('hidden');
    const [downHidden, setDownHidden] = useState('hidden');
    const [loading, setLoading] = useState('none');
    const [color, setColor] = useState(['', '']);
    const [colorMeta, setColorMeta] = useState('');
    const [colorG, setColorG] = useState('');
    const [compatibleR, setCompatibleR] = useState(false)
    const [compatibleM, setCompatibleM] = useState(false)
    const [compatibleG, setCompatibleG] = useState(false)
    const [compatibleMeta, setCompatibleMeta] = useState(false)
    const [alert, setAlert] = useState('')
    const [fname, setFname] = useState('')

    const colorOk='#90EE90';
    const colorNonOk='#FF5733'
    const errAlert = 'Make sure to choose a .fasta file for the reference field and a gzipped .vcf file for the variation field'
    const metaDisclaimer = 'The submission of a metainformation file is not mandatory and it will succeed only if the file is in csv format'

    const onInputChange = (e) => {
        
        if(e.target.id==='formFileReference'){
            setFileRef(e.target.files[0]);
            if(e.target.files[0]?.name && e.target.files[0]?.name.slice(-6)!=='.fasta') setCompatibleR(false)
            else setCompatibleR(true)
        }
        else if (e.target.id==='formFileMutation'){
            setFileMut(e.target.files[0]);
            if(e.target.files[0]?.name && e.target.files[0]?.name.slice(-7)!=='.vcf.gz') setCompatibleM(false)
            else setCompatibleM(true)
        }
        else if (e.target.id==='formFileGFA'){
            setFileGFA(e.target.files[0]);
            if(e.target.files[0]?.name && e.target.files[0]?.name.slice(-4)!=='.gfa') setCompatibleG(false)
            else setCompatibleG(true)
        }
        else if (e.target.id==='formGraphName'){
            setGraphName(e.target.value);
        }
        else{
            setFileMeta(e.target.files[0]);
            if (e.target.files[0]?.name && !/.*sv/.test(e.target.files[0]?.name.slice(-4))) setCompatibleMeta(false)
            else setCompatibleMeta(true)
        }
    }

    function handleNameChange(e){
        setFname(e.target.value)
    }
   
    function updateAvailable() {
        setAvailable([...available, fname])
        setAvailableHidden('hidden')
    }

    async function constructGraph (e) {    
        e.preventDefault();
        setFileMut(null)
        setFileRef(null)
        setFileMeta(null)
        setFname('')
        setLoading('')
        setHidden('hidden')
        const gType = graphType === 'assembly' ? 'A' : (compatibleMeta === true ? 'VM' : 'V')

        try {
            const res = await fetch('http://localhost:5001/demo/upload', {
                method: 'POST',
                body: JSON.stringify({name: graphName, graphType: gType}),  
                headers: { 'Content-Type': 'application/json' },  
            });
        } catch (err) {
            console.log(err);
        } 
        if (gType === 'A'){
            const formData = new FormData();
            formData.append('file', fileGFA);
            try {
                const res = await fetch('http://localhost:5001/demo/upload', {
                    method: 'POST',
                    body: formData,
                    
                });
                const data = await res.text();
                if (data === 'Terminated') setLoading('none')
            } catch (err) {
                console.log(err);
            }
        }
        else{
            const formData = new FormData();
            formData.append('file', fileRef);
            try {
                const res = await fetch('http://localhost:5001/demo/upload', {
                    method: 'POST',
                    body: formData,
                });
                console.log(await res.text());
            } catch (err) {
                console.log(err);
            } 
            const formData2 = new FormData();
            formData2.append('file', fileMut);
            try {
                const res = await fetch('http://localhost:5001/demo/upload', {
                    method: 'POST',
                    body: formData2,
                    
                });
                const data = await res.text();
                if (data === 'Terminated') setLoading('none')
            } catch (err) {
                console.log(err);
            }
            if ( gType === 'VM' ) {
                const formData3 = new FormData();
                formData3.append('file', fileMeta);
                try {
                    const res = await fetch('http://localhost:5001/demo/upload', {
                        method: 'POST',
                        body: formData3,

                    });
                    const data = await res.text();
                    if (data === 'Terminated') setLoading('none')
                } catch (err) {
                    console.log(err);
                }
            }
        }
        setGraphName('')
    }

    const download = (e) => {
        e.preventDefault()
        axios({
            url: "http://localhost:5001/demo/down",
            method: "GET",
            responsType: "blob"
        }).then(
            res => {
                FileDownload(res.data, "GraphDownloaded.gfa")
                console.log(res)
                setDownHidden('hidden')
            }
        )
    }

    useEffect(()=>{
        console.log(available.toString())
    },[available])

    useEffect(()=>{
        fetch(`//localhost:5001/demo/files`).then(
            res => res.json()
        ).then(
            data => { 
                let list = data.list.split(',')
                list.splice(list.indexOf('.DS_Store'),1)
                if (list.length){
                    setAvailable(list)
                }
            }
        )
    },[])

    useEffect(()=>{
        if (graphType === 'assembly'){
            document.getElementById('formFileReference').value=null
            document.getElementById('formFileMutation').value=null
            document.getElementById('formFileMeta').value=null
            setFileMeta(null)
            setFileRef(null)
            setFileMut(null)
            setCompatibleM(false)
            setCompatibleR(false)
            setCompatibleMeta(false)
        }else if (graphType === 'variation'){
            document.getElementById('formFileGFA').value=null
            setFileGFA(null)
            setCompatibleG(false)
        }
    },[graphType])

    useEffect(()=>{
        if (fileMeta?.name){
            if (compatibleMeta) {
                setColorMeta(colorOk)
            }else setColorMeta(colorNonOk)
        }else setColorMeta('')

        if (fileGFA?.name){
            if (compatibleG) {
                setColorG(colorOk)
            }else setColorG(colorNonOk)
        }else setColorG('')

        if ((fileRef?.name && fileMut?.name) || fileGFA?.name) {
            if ((compatibleR && compatibleM)) {
                setHidden('');
                setColor([colorOk,colorOk])
                setAlert('Ready to start the construction')
            }
            else if(compatibleG){
                setHidden('');
                setAlert('Ready to start the construction')
            }
            else {
                setHidden('hidden');
                setColor([colorNonOk,colorNonOk])
                setAlert(errAlert)
            }
        }
        else {
            setHidden('hidden')
            if (fileRef?.name){
                if(compatibleR){ 
                    setColor(['#ccc',''])
                    setAlert('')
                }
                else {
                    setColor([colorNonOk,''])
                    setAlert(errAlert)
                }
            }
            else if  (fileMut?.name) {
                if(compatibleM) {
                    setColor(['','#ccc'])
                    setAlert('')
                }
                else {
                    setColor(['',colorNonOk])
                    setAlert(errAlert)
                }
            }
            else {
                setColor(['',''])
                
            }
        }
    },[fileRef,fileMut,fileMeta,fileGFA])

    
    return (
        <div style={{with:'100%', height:'300px', display:'block'}}>
            <div className='construct'>
            <h2>Construct Graphs</h2>
            <ul>
                <li className="caption-row" key='variation' title='variation' value='variation'>  
                    <input type="checkbox" id={`check-variation`} checked={graphType==='variation'}/>
                    <label htmlFor='variation'>
                        <span className="circle" onClick={()=>{
                            if(graphType !== 'variation'){
                                setGraphType('variation')
                            }
                        }}/>
                        <div className="node-label">
                            <span>{'variation'}</span>
                        </div>
                    </label>  
                </li>

                <li className="caption-row" key='assembly' title='assembly' value='assembly'>  
                    <input type="checkbox" id={`check-assembly`} checked={graphType==='assembly'}/>
                    <label htmlFor='assembly'>
                        <span className="circle" onClick={()=>{
                            if(graphType !== 'assembly'){
                                setGraphType('assembly')
                            }
                        }}/>
                        <div className="node-label">
                            <span>{'assembly'}</span>
                        </div>
                    </label>  
                </li>
            </ul> 
            <div id="variation-div" style={{display: graphType==='variation' ? 'block' : 'none'}}>
                <div style={{with:'100%', height:'80%', display:'block', clear:'left'}} id='formcontainer'>
                    <p>{fileRef?.name}</p>
                    <p>{fileMut?.name}</p>
                    <p>{fileMeta?.name}</p>
                    <p>{fileGFA?.name}</p>
                    <label  className="form-label">
                        <div  className='formdiv' style={{backgroundColor: color[0]}}>
                            <h3>Referece fasta</h3>
                            <input className="form-control" onChange= {onInputChange} type="file" id="formFileReference"  style={{display: 'none'}}/>
                            <p>{fileRef?.name}</p>
                        </div>
                    </label>
                    <label for="formFileMutation" className="form-label">
                        <div  className='formdiv' style={{backgroundColor: color[1]}}>
                            <h3>Mutation vcf</h3>
                            <input className="form-control" onChange= {onInputChange} type="file" id="formFileMutation" style={{display: 'none'}} /> 
                            <p>{fileMut?.name}</p>
                        </div>
                    </label>
                    <label className="form-label">
                        <div  className='formdiv' style={{backgroundColor: colorMeta}}>
                            <h3>Meta-data csv</h3>
                            <input className="form-control" onChange= {onInputChange} type="file" id="formFileMeta" style={{display: 'none'}} /> 
                            <p>{fileMeta?.name}</p>
                        </div>
                    </label>
                </div>
            </div>
            <div id="assembly-div" style={{display: graphType==='assembly' ? 'block' : 'none'}}>
                <div style={{with:'100%', height:'80%', display:'block', clear:'left'}}>
                    <label  className="form-label">
                        <div  className='formdiv' style={{backgroundColor: colorG}}>
                            <h3>Graph gfa</h3>
                            <input className="form-control" onChange= {onInputChange} type="file" id="formFileGFA" style={{display: 'none'}}/>
                            <p>{fileGFA?.name}</p>
                        </div>
                    </label>
                </div>
            </div>
            <div style={{with:'100%', height:'70px', textAlign:'center', display:'block', clear: 'left'}}></div>
            <div style={{with:'100%', height:'100%', textAlign:'center', display:'block', clear: 'left'}}>
                <p className='err' hidden={hidden} style={{color:(((compatibleR && compatibleM) || compatibleG)? colorOk : colorNonOk), fontSize:'18px'}}>{alert}</p>
                <button onClick={constructGraph} hidden={hidden} className='constbtn' >Construct Graph</button>
                <div className="lds-roller" style={{display:loading}}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                <p style={{display:loading}}>This process could take a few minutes...</p>
                <button className='constbtn' hidden={downHidden} onClick={download}>Download Graph</button>
                <input type='text' placeholder='Choose graph name' hidden={availableHidden} onChange={handleNameChange}></input>
                <button className='constbtn' hidden={availableHidden} onClick={updateAvailable}>Add to available graphs</button>
                <div style={{display:'block', height:'10px'}}></div>
                <p style={{color:'#ccc', marginTop:'30px'}}>{metaDisclaimer}</p>
                <input id="formGraphName" type="text" placeholder="graph name" onChange= {onInputChange} value={graphName}></input>
            </div> 
            </div>
            <div className='construct'>
                <h2>Available Graphs</h2>                
                <ul>{available.map((gr) =>
                    <div>
                        <Link to="/graph" onMouseEnter={() => params.setName(gr)}>{gr}</Link>
                        <br />
                    </div>
                )}</ul>
            </div>
        </div>
    ) 
}
export default FileUploader;