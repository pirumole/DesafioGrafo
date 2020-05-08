class Util {
    constructor() {
        this.configs = require('./configs');
        this.http = require('http');
        this.fs = require('fs');
        this.server = new this.http.Server(function () { });
        this.csvFiles = {};
    }

    async readCsv() {
        let csvFiles = await this.fs.readdirSync(__dirname + '/documents');

        csvFiles = csvFiles.map((fileName) => {
            return {
                key: fileName.split('.')[0],
                fileName: fileName
            }
        });

        csvFiles.forEach((fileObject) => {
            this.csvFiles[fileObject.key] = {
                fileName: fileObject.fileName
            };
        });
    }

    async toJson(dataString = '') {
        let json, keys, values = [];

        json = dataString.split(/\n/g).filter((line) => { if (line) return line; });
        keys = json[0].split(/\,/g).filter((line) => { if (line) return line; });
        for (let x = 1; x < json.length; x++) {
            let _data = json[x].split(/\,/g);
            let lineData = {};
            lineData.id = x;
            for (let y = 0; y < keys.length; y++) {
                lineData[keys[y]] = _data[y];
            }
            values.push(lineData);
        }

        return values;
    }

    async readCsvData() {
        for (let key in this.csvFiles) {
            let object = this.csvFiles[key];

            let fileData = await this.fs.readFileSync(__dirname + `/documents/${object.fileName}`, { encoding: 'utf8' });
            this.csvFiles[key].originalData = fileData;
            this.csvFiles[key].jsonData = await this.toJson(fileData);
        }
        return this;
    }

    async saveFile() {
        for (let key in this.csvFiles) {
            let object = this.csvFiles[key];
            await this.fs.writeFileSync(
                __dirname + `/jsons/${key}.json`,
                JSON.stringify(object.jsonData),
                { encoding: 'utf8' }
            );
        }
        return true;
    }

    async grafoData() {
        let stringFile = await this.fs.readFileSync(
            __dirname + `/jsons/Connections.json`,
            { encoding: 'utf8' }
        );

        let stringJson = JSON.parse(stringFile);
        stringJson.push({
            "id": 44,
            "FirstName": "João Victor",
            "LastName": "Palmeira da Silva Ferreira",
            "backgroundcolor" : 'blue'
        });

        let grafoData = [];
        stringJson.forEach((data) => {
            grafoData.push({ data: data });
        });

        let grafoEdge = [];
        stringJson.forEach((data) => {
            if (data.id == 44) return true;
            grafoEdge.push({
                data: {
                    id: data.id + '\'' + 44,
                    weight: 20,
                    source: data.id,
                    target: 44,
                    "curve-style": "straight",
                    "arrow": "vee"
                }
            });
        });
        // stringJson.forEach((data) => {
        //     console.log(data);
        //     if (data.id == 44) continue;
        // });


        return {
            nodes: grafoData,
            edges: grafoEdge
        }
    }
}

class MyCroServer extends Util {
    constructor() {
        super();
    }

    log() {
        console.log(`server open in http://${this.configs.host}:${this.configs.port}`);
    }

    async open() {
        this.server = this.http.createServer(async (request, response) => {
            if (/\/data/g.test(request.url)) {
                response.statusCode = 200;
                response.write(JSON.stringify(await this.grafoData()));
                return response.end();
            }

            if (/\/public\//g.test(request.url)) {
                response.write(await this.fs.readFileSync(__dirname + '/public/index.js', { encoding: 'utf8' }));
                response.statusCode = 200;
                return response.end();
            }

            response.write(await this.fs.readFileSync(__dirname + '/public/index.html', { encoding: 'utf8' }));
            response.statusCode = 200;
            response.statusMessage = 'success';
            return response.end();
        });
        this.server.listen(this.configs, () => this.log());
    }
}

(new MyCroServer).open();