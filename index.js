'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const express = require('express');
const prometheus = require('prom-client');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));

const app = express();

const petitionGauge = new prometheus.Gauge({
    name: 'petition_count',
    help: 'current petition count',
    labelNames: ['petition_id'],
});

app.get('/metrics', (req, res) => {
    res.end(prometheus.register.metrics());
});

async function getPetitionCount(id) {
    const dom = await JSDOM.fromURL(`https://www1.president.go.kr/petitions/${id}`, {});
    return parseInt(dom.window.document.querySelector('.counter').textContent.replace(',', ''));
}

function updateAllPetitions() {
    for (let id of config.petitions) {
        let id_tmp = id;
        getPetitionCount(id).then((cnt) => {
            petitionGauge.set({
                petition_id: id_tmp,
            }, cnt);
        });
    }
}

setInterval(() => {
    updateAllPetitions();
}, config.metrics.refreshInterval);
updateAllPetitions();

app.listen(config.metrics.port);
