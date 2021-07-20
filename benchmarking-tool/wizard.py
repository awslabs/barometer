from __future__ import print_function, unicode_literals

import json
import os
from pprint import pprint

from PyInquirer import Validator, ValidationError, Separator
from PyInquirer import style_from_dict, Token, prompt

style = style_from_dict({
    Token.QuestionMark: '#E91E63 bold',
    Token.Selected: '#673AB7 bold',
    Token.Instruction: '',  # default
    Token.Answer: '#2196f3 bold',
    Token.Question: '',
})


class NumberValidator(Validator):
    def validate(self, document):
        try:
            int(document.text)
        except ValueError:
            raise ValidationError(
                message='Please enter a number',
                cursor_position=len(document.text))  # Move cursor to end


class MissingTextValidator(Validator):
    def validate(self, document):
        if len(document.text) == 0:
            raise ValidationError(
                message='Please enter a text',
                cursor_position=len(document.text))  # Move cursor to end


print('Welcome to the Benchmarking tool CLI wizard')

workload_questions = [
    {
        'type': 'input',
        'name': 'name',
        'message': 'Please provide name of the workload (You will be able to use workload by this name later)',
        'validate': MissingTextValidator
    },
    {
        'type': 'list',
        'name': 'type',
        'message': 'What is your workload type?',
        'choices': ['Analytics/OLAP', 'Transactional/OLTP']
    }, {
        'type': 'list',
        'name': 'dataset',
        'message': 'What is the right dataset for your workload?',
        'choices': ['TPC-DS V3', 'TPC-DS V2', 'TPC-H V2']
    }, {
        'type': 'input',
        'name': 'size',
        'message': 'Size of the dataset in GB?',
        'validate': NumberValidator,
        'filter': lambda val: int(val)
    }]
platform_questions = [
    {
        'type': 'input',
        'name': 'name',
        'message': 'Please provide name of the platform (You will be able to use platform by this name later)',
        'validate': MissingTextValidator
    },
    {
        'type': 'list',
        'name': 'service',
        'message': 'Select the platform',
        'choices': ['Amazon Redshift', 'Amazon Redshift Spectrum']
    }, {
        'type': 'checkbox',
        'name': 'options',
        'message': 'Choose all the features you want to enable',
        'choices': [Separator('= Amazon Redshift Features ='), {'name': 'Work load manager (WLM)'},
                    {'name': 'Advanced Query Accelerator (AQUA)'}, {'name': 'Concurrency Scaling'}]
    }, {
        'type': 'list',
        'name': 'instance',
        'message': 'Select Redshift cluster node type',
        'choices': ['ra3.xplus', 'ra3.4xlarge', 'ra3.16xlarge', 'ds2.xlarge', 'ds2.8xlarge', 'dc2.large',
                    'dc2.8xlarge']
    }, {
        'type': 'input',
        'name': 'noOfInstances',
        'message': 'How many instances you want to add to the cluster?',
        'validate': NumberValidator,
        'filter': lambda val: int(val),
        'default': '2'
    }]

config = {
    "workloads": [],
    "platforms": [],
    "experiments": []
}

if os.path.exists('config.json') and prompt({
    'type': 'confirm',
    'message': 'Do you want to load previously saved experiments?',
    'name': 'continue',
    'default': True,
}, style=style):
    with open('config.json') as json_file:
        config = json.load(json_file)


def print_conf(configs):
    to_print = []
    for c in configs:
        for k in c:
            to_print.append(c[k])
    print(to_print)


while True:
    main_ans = prompt({
        'type': 'list',
        'name': 'path',
        'message': 'What do you want to do?',
        'choices': ['Add Workload', 'Add Platform', 'Add Experiment', 'Run Experiment', 'Show All', 'Reset All',
                    'Exit Wizard']
    }, style=style)

    if main_ans['path'] == 'Add Workload':
        config["workloads"].append(prompt(workload_questions, style=style))
    if main_ans['path'] == 'Add Platform':
        config["platforms"].append(prompt(platform_questions, style=style))
    if main_ans['path'] == 'Add Experiment':
        experiment_questions = [
            {
                'type': 'input',
                'name': 'name',
                'message': 'Please provide name of the experiment',
                'validate': MissingTextValidator
            },
            {
                'type': 'list',
                'name': 'workload',
                'message': 'Select the workload',
                'choices': config["workloads"]
            }, {
                'type': 'list',
                'name': 'platform',
                'message': 'Select the platform',
                'choices': config["platforms"]
            }
        ]
        config["experiments"].append(prompt(experiment_questions, style=style))
    if main_ans['path'] == "Run Experiment":
        experiments_to_run = prompt({
            'type': 'checkbox',
            'name': 'runs',
            'message': 'Choose all the experiments you want to run',
            'choices': [Separator('= Experiments to run ='), *config['experiments']]
        }, style=style)
        print("Running experiments: \n")
        pprint(experiments_to_run)
    if main_ans['path'] == 'Show All':
        print("== All workloads ==\n")
        print_conf(config['workloads'])
        print("== All platforms ==\n")
        print_conf(config['platforms'])
        print("== All experiments ==\n")
        print_conf(config['experiments'])
    if main_ans['path'] == 'Reset All':
        config = {
            "workloads": [],
            "platforms": [],
            "experiments": []
        }
    if main_ans['path'] == 'Exit Wizard':
        ans = prompt({
            'type': 'confirm',
            'message': 'Do you want to save all experiments?',
            'name': 'continue',
            'default': True,
        }, style=style)
        if ans:
            with open('config.json', 'w') as fp:
                json.dump(config, fp, indent=4)
        break
