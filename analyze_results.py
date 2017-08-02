# -*- coding: utf-8 -*-
"""
Created on Thu Jun 30 09:57:25 2016

@author: xcao
"""

#Script to extract result files
results_path = "/home/xcao/cao/projects/eye-tracking_EEG/project_EEG_yue/results"
#results_path_fr = "/home/xcao/cao/projects/eye-tracking_EEG/project_EEG_yue/results_fr"
test_path = "/home/xcao/cao/projects/eye-tracking_EEG/project_EEG_yue/experiment/sounds/sound_sequences_250ms_aaabbb/test"
#test_path = "/home/xcao/cao/projects/eye-tracking_EEG/project_EEG_yue/experiment_fr/sounds/test"
output_path = "/home/xcao/cao/projects/eye-tracking_EEG/project_EEG_yue/output_results_csv"

import os
import re


#list all wav and result files recusively from one directory
def list_txt(input_dir):
    file_list = []
    for dirpath, dirs, files in os.walk(input_dir):
        for f in files:
              m_file = re.match("run_(.*)\.txt$", f)
              if m_file:
                  file_list.append(os.path.join(dirpath, f))
    return file_list

def list_wav(input_dir):
    file_list = []
    for dirpath, dirs, files in os.walk(input_dir):
        for f in files:
              m_file = re.match("(.*)\.wav$", f)
              if m_file:
                  file_list.append(os.path.join(dirpath, f))
    return file_list

def extract_res(res_files, o):
    outfile = open(os.path.join(output_path, o), 'w')
    outfile.write('Name\tLanguage_Subj\tOther_Languages\tSound_Pair\tlanguage_stim\tDifficulty\tRhythm\tVariability\tAns\tRt\n')
    for res in res_files:
        infile = open(res, 'r')
        lines=infile.read().splitlines()
        list_subject = []
        list_file = []
        list_expected_answer = []
        list_answer = []
        list_rt = []
        lang_subj = ""
        other_lang = ""
        sound_pair = ""
        language_stim = ""
        level = ""
        freq = ""
        var = ""
        subj_e_answer = ""
        subj_a_answer = ""
        subj_rt = ""
        subj_correct = ""
        list_subject= lines[0].split(',')
        list_subject[0] = list_subject[0].replace("subject_info: ", "")
        lang_subj = list_subject[3]
        lang_subj = lang_subj.replace("ENGLISH", "Us")
        lang_subj = lang_subj.replace("English", "Us")
        lang_subj = lang_subj.replace("french/english", "Fr/Us")
        lang_subj = lang_subj.replace("French", "Fr/Us")
        lang_subj = lang_subj.replace("Spanish", "Sp")
        lang_subj = lang_subj.replace("Mandarin", "Cn")
        other_lang = list_subject[5]
        if (other_lang == ""):
            other_lang = "N/A"
        name = list_subject[0] + ' ' + list_subject[1]
        list_file = lines[1].split(',')
        #print(list_file)
        list_file[0] = list_file[0].replace("tri_file: ", "")
        list_expected_answer = lines[2].split(',')
        list_expected_answer[0] = list_expected_answer[0].replace("tri_expected_answer: ", "")
        list_answer = lines[4].split(',')
        list_answer[0] = list_answer[0].replace("answer: ", "")
        list_rt  = lines[5].split(',')
        infile.close()
        for i in list_file:
            filter_train = re.match("(.*)apple|dog|cow|lion(.*)", i)
            if filter_train:
                continue
            else:
                match_code = re.match("(.*)_(E|M|D)_(freq(3|2))_(.*)_(s|m|n)", i)
                if match_code:
                    sound_pair = match_code.group(1)
                    sound_pair = sound_pair.replace('_1', '')
                    sound_pair = sound_pair.replace('_2', '')
                    list_words_fr = ["pas", "pot", "peu", "pus", "pou", "paon", "pont"]
                    if any(x in sound_pair for x in list_words_fr):
                        language_stim = "fr"
                    else:
                        language_stim = "en"
                    level = match_code.group(2)
                    if level == ("E"):
                        level = "diff-1"
                    elif level == ("M"):
                        level = "diff-2"
                    elif level == ("D"):
                        level = "diff-3"
                    freq = match_code.group(3)
                    freq = freq.replace('freq', '')
                    var = match_code.group(6)
                    if var == ("s"):
                        var = "1-sp"
                    elif var == ("m"):
                        var = "male-sp"
                    elif var == ("n"):
                        var = "total-sp"
                    index_file = list_file.index(i)
                    subj_e_answer = list_expected_answer[index_file]
                    subj_a_answer = list_answer[index_file]
                    subj_rt = list_rt[index_file]
                if (subj_a_answer == "0"):
                    subj_correct = "don't know"
                elif (subj_e_answer == subj_a_answer):
                    subj_correct = 1
                else:
                    subj_correct = 0
                outfile.write(name + '\t' + lang_subj + '\t' + other_lang + '\t' + sound_pair + '\t' + language_stim + '\t' + level + '\t' + freq + '\t' + var + '\t' + str(subj_correct) + '\t' + str(subj_rt) + '\n')
    outfile.close()
    
res_files_en = list_txt(results_path)
#res_files_fr = list_txt(results_path_fr)
#res_files_merged = res_files_en + res_files_fr
extract_res (res_files_en, "output_results_XN_02-21-2017.csv")
#extract_res (res_files_en, "output_results_ED2.csv")