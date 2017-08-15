echo [ > batch.txt;
ls intphys_test/*/test/*/*/scene/video.gif | xargs -n1 | sed 's/.*/\\"&\\"/g' | xargs -n"$1" | sed 's/ /, /g' | 
sed 's/.*/[&],/' >> batch.txt;
truncate -s-1 batch.txt;
echo ] >> batch.txt
