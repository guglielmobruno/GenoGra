const express = require('express');
const multer = require('multer');
const cors = require('cors');
const compression = require('compression');
var bodyParser = require("body-parser");

const app = express();
require('events').EventEmitter.defaultMaxListeners = 15;
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
let name = 'graph_' + Date.now()
let graphType = 'A'
const fs = require("fs");
const path = "./public/";

app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true ,limit: '50mb'}));

function deleteFile (name) {
    try {
        fs.unlinkSync(path+name);
        console.log("File removed:", path);
    } catch (err) {
        console.error(err);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/data')
        if (file.originalname?.slice(-4)==='.gfa' || file.originalname?.slice(-2)==='sv') cb(null, 'public/result')
    },
    filename: (req, file, cb) => {
        if(file.originalname?.slice(-6)==='.fasta') cb(null, 'reference.fasta')
        else if(file.originalname?.slice(-7)==='.vcf.gz') cb(null, 'variation.vcf.gz')
        else if(file.originalname?.slice(-4)==='.gfa') cb(null, 'graph.gfa')
        else cb(null, 'metadata.tsv')
    }
});

const upload = multer({storage});

async function construct(json_name, graph_type) {
    if (graph_type === 'V' || graph_type === 'VM'){
        await exec('bash bash_scripts/vg.sh')
        console.log('vcf tabixato');
        await exec('bash bash_scripts/vg1.sh');
        console.log('first part done');
        await exec('bash bash_scripts/vg2.sh');
        console.log('terminated')
        deleteFile('middle/graph.xg')
        deleteFile('middle/graph.gg')
        deleteFile('middle/graph.gbwt')
        deleteFile('data/reference.fasta')
        deleteFile('data/reference.fasta.fai')
        deleteFile('data/variation.vcf.gz')
        deleteFile('data/variation.vcf.gz.tbi')
    }
    console.log(`python gfa2json.py ./public/result ${json_name} ${graph_type}`)
    await exec(`python gfa2json.py ./public/result ${json_name} ${graph_type}`)
    console.log('fatto')
    deleteFile('result/graph.gfa')
    deleteFile('result/graph_walks.gfa')
    deleteFile('result/graph.vg')
    deleteFile('result/metadata.tsv')
}
async function parseAndUpload() {
    var proc = await exec('bash bash_scripts/parse_upload.sh')
    console.log('final doc created');
}


async function align(sequence, name) {
    await exec(`cd ../../vg && vg view -F -v ../finale/server/public/alignment/${name}/${name}.gfa > ../finale/server/public/alignment/${name}/${name}.vg && vg align -s ${sequence} -j ../finale/server/public/alignment/${name}/${name}.vg>../finale/server/public/alignment/${name}/alignment.json`)
}


// const constructAndSend = async (res) => {
//     const result = await construct('gggggraph', 'VM')
//     await parseAndUpload()
//     const file=fs.readdirSync('../client/public/available')
//     return res.json({message: 'done', name: 'new-sars', list: file.toString()})
// }

app.get('/demo/files', (req, res, next) => {
     try {
        const file = fs.readdirSync('../client/public/available')
        console.log(file)
        return res.json({list:file.toString()})
    }catch (err) {
        console.log(err);
    }
    
});

app.post('/demo/align', (req,res) => {
    align(req.body.seq)
    if (err) {
        return res.status(500).json(err)
    }else return res.status(200)
})

app.post('/api/sendstring', (req, res) => {
    const { string, graph, graphName } = req.body;
    // Execute function here
    const date = Date.now()
    const newGraphName = graphName.replace('.json', '')
    const fileName = newGraphName + '_' + date
    const folderName = '../server/public/alignment/' + fileName
    try {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
            fs.writeFile(folderName + '/'+ fileName + '.gfa', graph, (err) => {
                if (err)
                    console.log(err);
                else {
                    console.log("File written successfully\n")
                }
            })
            align(string, fileName)
            setTimeout(() => {fs.readFile(`./public/alignment/${fileName}/alignment.json`, 'utf8', (err,data) => {
                    if (err)
                      console.log(err);
                    else {
                      res.send(data)
                    }})}, 2000) 
        }    
    }catch (err) {
        console.error(err);
    }
});

app.post('/vision', (req, res) => {
    const date = Date.now()
    const fileName = './public/vision/' +req.body.name.slice(0,-5) + '_' + date + '.gfa'
    fs.writeFile(fileName , req.body.graph, (err) => {
        if (err) throw err;
        res.download(fileName);
    });
});

app.get('/demo/down', (req, res, next) => {
    if (req) try {
        const file = `./public/result/graph_walks.gfa`;
        res.download(file);
        console.log('here');
    }catch (err) {
        console.log(err);
    }
});

app.post('/demo/upload', upload.single('file'), async  (req, res) => {
    try {
        if (req.body.name){
            name = req.body.name
        }
        if (req.body.graphType){
            graphType = req.body.graphType
            if (graphType === 'A') {
                await construct(name, graphType)
            } 
        }
        if ( req.file.originalname.slice(-3) === '.gz' && graphType === 'V') {
            const result = await construct(name, graphType)
        }
        let message = req.file.originalname.slice(-3) !== '.gz' ? 'first file uploaded' : graphType==='V' ? 'Terminated' : 'Second file uploaded'
        if (req.file.originalname.slice(-2) === 'sv' && graphType === 'VM'){
            message = 'Terminated'
            await construct(name, graphType)
        } 
        res.send(message)  

    } catch (err) {
        res.status(500).send(err);
    }
});
  
app.listen(5001, () => {
    console.log(`Server listening on port 5001`);
});

