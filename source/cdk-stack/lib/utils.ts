import * as fs from "fs";


export class Utils {
    static listPaths(path: string, directoriesOnly = false): Array<string> {
        return fs.readdirSync(path).filter(function (file) {
            let doFilter = true;
            if (directoriesOnly) doFilter = fs.statSync(path + '/' + file).isDirectory();
            return doFilter;
        });
    }
}