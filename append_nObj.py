import json
import sys
import shutil
import os
from pprint import pprint


dir = sys.argv[1]
with open(os.path.join(dir, 'params.json')) as file:
    data = json.load(file)
    nSphere = len(data['objects'])

shutil.move(dir, dir + '_nObj' + str(nSphere))
