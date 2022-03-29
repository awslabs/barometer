import * as fs from "fs";

export class Utils {
    static listPaths(path: string, directoriesOnly = false): Array<string> {
        return fs.readdirSync(path).filter(function (file) {
            let doFilter = true;
            if (directoriesOnly) doFilter = fs.statSync(path + '/' + file).isDirectory();
            return doFilter;
        });
    }

    static createDir(dir: string): void {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }

    static writeToDir(dir: string, fileName: string, json: any): void {
        Utils.createDir(dir);
        fs.writeFileSync(dir + "/" + fileName, JSON.stringify(json));
    }

    static readJson(path: string): any {
        return JSON.parse(fs.readFileSync(path, 'utf-8'));
    }
}