#!/bin/bash

path_data=../finale/server/public/data
path_mid=../finale/server/public/middle
path_res=../finale/server/public/result
size=25000

cd ../../vg
vg construct -r $path_data/reference.fasta -v $path_data/variation.vcf.gz -a -m $size> $path_res/graph.vg
echo 'graph.vg created'
vg view $path_res/graph.vg>$path_res/graph.gfa
echo 'coverted to gfa'
vg index -x $path_mid/graph.xg -G $path_mid/graph.gbwt -v $path_data/variation.vcf.gz $path_res/graph.vg
echo 'indexed'