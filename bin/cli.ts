import dotenv from 'dotenv';
import path from 'path';

import { ProjectData } from '../src/lib/recognisers/projectData';
import { SmartAppBrainRecognizer } from '../src/lib/recognisers/smartAppBrain';

import projectData from './project-data.json';

dotenv.config({
    path: path.resolve(__dirname, '..', '.env'),
});

const brain = new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN);

brain.export().then((data) => {
    console.log(JSON.stringify(data, null, 2));
});

brain.import(projectData as ProjectData).then((data) => {
    console.log(JSON.stringify(data, null, 2));
});

brain.train().then(() => {
    brain.waitTillTrainingIsDone().then((status) => {
        console.log(status);
    });
});
