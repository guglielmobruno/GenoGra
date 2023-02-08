import sys
import random 
import csv
import json

def csv_row_to_json(csv_row, header):
    return dict(zip(header, csv_row))

def determine_delimiter(file):
    with open(file, 'r') as f:
        sample = f.read(1024)
    delimiters = [',', '\t', ';', '|']
    delimiter = max(delimiters, key=lambda d: sample.count(d))
    return delimiter

def get_samples_list(file_path):

# extract reference path
    graph=open(file_path + '/graph.gfa', 'r')
    ref_mid=[]
    for line in graph:
        line=line[:-1]
        line=line.split('\t')
        if line[0]=='P': 
            print('si')
            ref = line[2].replace('+', '')
            ref = ref.split(',')
            for i in range(len(ref)-1):
                ref_mid.append(ref[i] + '-' + ref[i+1])
            break
    graph.close()
    
    print('prima parte')
# find differences between ref path and samples' paths
    graph=open(file_path + '/graph_walks.gfa', 'r')
    nodes_samp = {}
    samp2node={}
    j=0
    for line in graph:
        j+=1
        if (j%1000 == 0): print(j)
        line=line[:-1]
        line=line.split('\t')
        start = ',\n'
        path_mid=[]
        if line[0]=='W':
            path = line[6][1:].split('>')
            samp_id = line[1]
            for i in range(len(path)-1):
                path_mid.append(path[i] + '-' + path[i+1])
            differences = list(set(path_mid) - set(ref_mid))
            # print('pm'+str(len(path_mid)))
            # print('pr'+str(len(ref_mid)))

            if differences != []:
                for el in differences:
                    if el in samp2node:
                        samp2node[el].append(line[1])
                    else:
                        samp2node[el] = [line[1]]
                    el = el.split('-')
                    for e in el:
                        if e in nodes_samp:
                            if samp_id not in nodes_samp[e]:
                                nodes_samp[e].append(samp_id)
                        else:
                            nodes_samp[e]=[samp_id]
                            
    print('seconda parte')
    return nodes_samp, ref_mid, samp2node


def gfa2json(file_path, name, type_of_graph):

# extracting the reference path, and the lists of samples linked to nodes and edges if the graph is a Variation one
    if (type_of_graph == 'V' or type_of_graph =='VM'):
        nodes_samp, ref_path, samp2node = get_samples_list(file_path)
        print('samples saved')
    pathR = file_path + '/graph.gfa'
    graph = open(pathR, 'r')
    pathW = '../client/public/available/' + name + '.json'
    json_file = open(pathW, 'w')
    primoS = True
    primoL = True
    content = ''

    for line in graph:
        line=line[:-1]
        line=line.split('\t')
        start = ',\n'
        if line[0]=='W':
            break

# creating nodes           
        if line[0]=='S':
            tag = 'mutation'
            if (primoS): 
                start = '{\n\t"name": "' +  name + '",\n\t"type": "' +  type_of_graph + '",\n\t"nodes": \n\t\t[\n'
                primoS=False
            if (type_of_graph == 'A'):
                if (len(line) > 3):
                    content+=start+'\t\t{\n\t\t\t"key": "'+ line[1] +'",\n\t\t\t"label": "'+line[1]+'",\n\t\t\t"cluster": "0",\n\t\t\t"x": "'+str(random.randint(1,100))+'",\n\t\t\t"y": "'+str(random.randint(1,100))+'",\n\t\t\t"score": 0.1,\n\t\t\t"sequence": "'+line[2]+'",\n\t\t\t"KC": "'+line[3]+'"\n\t\t}'
                else:
                    content+=start+'\t\t{\n\t\t\t"key": "'+ line[1] +'",\n\t\t\t"label": "'+line[1]+'",\n\t\t\t"cluster": "0",\n\t\t\t"x": "'+str(random.randint(1,100))+'",\n\t\t\t"y": "'+str(random.randint(1,100))+'",\n\t\t\t"score": 0.1,\n\t\t\t"sequence": "'+line[2]+'"\n\t\t}'
            else:
                for el in ref_path:
                    el = el.split('-')
                    if (str(line[1]) in el): 
                        tag = 'reference'
                        break
                if line[1] in nodes_samp:
                    samp_value = '", "'.join(nodes_samp[line[1]])
                else:
                    samp_value = 'reference'
                content+=start+'\t\t{\n\t\t\t"key": "'+ line[1] +'",\n\t\t\t"label": "'+line[1]+'",\n\t\t\t"tag": "'+tag+'",\n\t\t\t"cluster": "0",\n\t\t\t"x": "'+str(random.randint(1,100))+'",\n\t\t\t"y": "'+str(random.randint(1,100))+'",\n\t\t\t"score": 0.1,\n\t\t\t"sequence": "'+line[2]+'",\n\t\t\t"sample": ["'+ samp_value +'"]\n\t\t}'

# creating edges
        elif (line[0]=='L'):
            link = (line[1] + '-' + line[3])
            if (primoL): 
                start = '\n\t],\n\t"edges": [\n'
                primoL = False

# assigning value for from_is_reverse
            if line[2]=='-': from_sign = 'true'
            else: from_sign = 'false'

# assigning value for to_is_reverse
            if line[4]=='-': to_sign = 'true'
            else: to_sign = 'false'

# checking if the edge is contained in the reference path
            if (type_of_graph =='V' or type_of_graph =='VM'):
                if link in ref_path: is_ref = 'true'
                else: is_ref = 'false'
            else: is_ref = 'false'

# checking which samples are related to the edge 
            if (type_of_graph =='V' or type_of_graph =='VM'):
                if link in samp2node: samp_edge = samp2node[link]
                else: samp_edge=''
            else: samp_edge=''
            content+=start+'\t\t["'+ line[1]+'","'+ line[3] +'","'+ is_ref +'","'+ ', '.join(samp_edge) +'","'+ from_sign+'","'+ to_sign +'"]'

    if (type_of_graph == 'VM'):
        content += '],\n\t"metadata": \n\t\t'
        pathM = file_path + '/metadata.tsv'
        delimiter = determine_delimiter(pathM)
        with open(pathM, 'r') as f:
            reader = csv.reader(f,  delimiter=delimiter)
            header = next(reader)
            data = [csv_row_to_json(row, header) for row in reader]
            json_data = json.dumps(data, ensure_ascii=False, separators=(',\n', ':'))
        content+=json_data
    if(type_of_graph != 'VM'): content+=']'
    content += ',\n\t"clusters": [\n\t\t{ "key": "0", "clusterLabel": "" }\n\t],\n\t"tags": [\n\t\t{ "key": "reference", "color": "#7cb9e8"},\n\t\t{ "key": "mutation", "color": "#fbceb1"}\n\t]\n}'
    json_file.write(content)
    json_file.close()
    graph.close()
    
if __name__ == "__main__":
    gfa2json(sys.argv[1], sys.argv[2], sys.argv[3] )