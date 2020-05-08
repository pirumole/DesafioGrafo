class Main {
    constructor() {
        this.cytoscape = cytoscape;
        this.core = null;
        this.cy = document.getElementById('cy');
        window.onresize = (event) => {
            let { innerWidth, innerHeight } = window;
            this.cyOffSet(innerWidth, innerHeight);
        };
        window.document.body.style.overflow = 'hidden';
    }

    requestAsync(url) {
        return new Promise((resolve, reject) => {
            try {
                var xmlHttp = new XMLHttpRequest();

                xmlHttp.onloadend = function () {
                    return resolve(xmlHttp.responseText);
                }

                xmlHttp.open("GET", url, true);
                xmlHttp.send(null);
            } catch (error) {
                return reject(error);
            }
        });
    }

    async cyOffSet(width, height) {
        this.cy.style.width = `${width}px`;
        this.cy.style.height = `${height}px`;
    }

    async run() {
        let { innerWidth, innerHeight } = window;
        this.data = await this.requestAsync('/data');
        this.data = JSON.parse(this.data);
        await this.cyOffSet(innerWidth, innerHeight);
        this.core = this.cytoscape({
            container: this.cy,
            elements: {
                nodes: this.data.nodes || [],
                edges: this.data.edges || []
            },
            style: [
                {
                    selector: 'node',
                    css: {
                        'content': 'data(FirstName)',
                        'background-color': el => {
                            if (el._private.data.backgroundcolor) return el._private.data.backgroundcolor;
                            else return 'red';
                        },
                        'color': 'black',
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'line-color': 'red',
                        'width': 3,
                    }
                }
            ],
            layout: {
                name: 'random',
                directed: true,
                padding: 10
            }
        });
    }
}

window.onload = () => (new Main).run();