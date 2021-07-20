import cmd, sys


class Experiments(cmd.Cmd):
    intro = 'Welcome to the benchmarking CLI tool.\n Options: (E)xpermient, (P)latform, (W)orkload'
    prompt = 'Enter command to start (E/P/W): '
    file = None

    def do_workload(self, arg):
        'Defines new workload'
        print('W')

    def do_platform(self, arg):
        'Defines new platform'
        print('P')

    def do_experiment(self, arg):
        'Defines new experiment linking platform & workload'
        print('E')

    def do_done(self, arg):
        'Saves experiments'
        pass

    # def do_p(self, arg):
    #     self.do_platform(arg)
    #
    # def do_e(self, arg):
    #     self.do_experiment(arg)
    #
    # def do_w(self, arg):
    #     self.do_workload(arg)


if __name__ == '__main__':
    Experiments().cmdloop()
