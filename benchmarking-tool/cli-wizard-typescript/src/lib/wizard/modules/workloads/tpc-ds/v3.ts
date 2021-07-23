// ,
//     {
//       type: 'list',
//       name: 'scale_factor_tpc_ds',
//       message: 'Which TPC-DS scale factor would you like to use ?',
//       hint: '- Use <space> to select and <return> to submit.',
//       choices: [
//         { 'name': '10k', 'value': '10000' },
//         { 'name': '100k', 'value': '100000' },
//         new inquirer.Separator(),
//         { 'name': 'Return to the "Manage Workload" step', 'value': 'exit-module' },
//         { 'name': 'Exit CLI', 'value': 'exit' },
//         new inquirer.Separator(),
//       ],
//       when: function (answers: { value: string; }): boolean {
//         // Only run if user set a name
//         return (answers.value.startsWith('tpc-ds'));
//       },
//     },
//     {
//       type: 'list',
//       name: 'scale_factor_tpc_h',
//       message: 'Which TPC-H scale factor would you like to use ?',
//       hint: '- Use <space> to select and <return> to submit.',
//       choices: [
//         { 'name': '100', 'value': '100' },
//         { 'name': '1k', 'value': '1000' },
//         { 'name': '3k', 'value': '3000' },
//         { 'name': '10k', 'value': '10000' },
//         { 'name': '30k', 'value': '30000' },
//         { 'name': '100k', 'value': '100000' },
//         new inquirer.Separator(),
//         { 'name': 'Return to the "Manage Workload" step', 'value': 'exit-module' },
//         { 'name': 'Exit CLI', 'value': 'exit' },
//         new inquirer.Separator(),
//       ],
//       when: function (answers: { value: string; }): boolean {
//         // Only run if user set a name
//         return (answers.value.startsWith('tpc-h'));
//       },
//     },