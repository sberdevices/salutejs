/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */

import { join } from 'path';
import { promises } from 'fs';
import { Command } from 'commander';
import logSymbols from 'log-symbols';
import { IntentsDict } from '@salutejs/types';
import { config as dotenv } from 'dotenv';

import { permittedSystemEntites } from '../lib/permittedSystemEntities';
import {
    convertIntentsForImport,
    getEntitiesFromResponse,
    getIntentsFromResponse,
    EntitiesDict,
    convertEntitiesForImport,
} from '../lib/smartAppBrainSync';
import { SmartAppBrainRecognizer } from '../lib';

dotenv();

const cli = new Command();

cli.command('pull')
    .option('-t, --token <token>', 'SmartApp Brain access token', process.env.SMARTAPP_BRAIN_TOKEN)
    .option('-p, --path <path>', 'Path to intents dictionary file', 'src/intents.json')
    .action(async ({ token, path }) => {
        const brain = new SmartAppBrainRecognizer(token);
        const intentsDictPath = join(process.cwd(), path);
        const projectData = await brain.export();

        const intentsFromResponse = getIntentsFromResponse(projectData);
        const entitiesFromResponse = getEntitiesFromResponse(projectData);

        const result = {
            intents: intentsFromResponse,
            entities: entitiesFromResponse,
        };

        await promises.writeFile(intentsDictPath, JSON.stringify(result, null, 2));
        console.log(logSymbols.success, 'Successfuly updated!');
    });

cli.command('push')
    .option('-t, --token <token>', 'SmartApp Brain access token', process.env.SMARTAPP_BRAIN_TOKEN)
    .option('-p, --path <path>', 'Path to intents dictionary file', 'src/intents.json')
    .action(async ({ token, path }) => {
        const brain = new SmartAppBrainRecognizer(token);
        const intentsDictPath = join(process.cwd(), path);
        const projectData = await brain.export();
        const {
            entities: entitiesFromFS,
            intents: intentsFromFS,
        }: {
            intents: IntentsDict;
            entities: EntitiesDict;
        } = require(intentsDictPath);
        const intentsConvertedForImport = convertIntentsForImport(intentsFromFS);
        const entitiesConvertedForImport = convertEntitiesForImport(entitiesFromFS);

        const usedEntities = new Set<string>();
        for (const intent of Object.values(intentsFromFS)) {
            if (Array.isArray(intent.matchers)) {
                intent.matchers.forEach(({ rule }) => {
                    const matched = rule.match(/@[a-zA-Z0-9._-]+/gi);
                    if (matched) {
                        matched.forEach((entitity) => {
                            const normalized = entitity.replace('/^@/', '');
                            if (!permittedSystemEntites.includes(normalized as any)) {
                                throw new Error(
                                    `"${normalized}" is not a system entity. These are allowed: ${permittedSystemEntites.join(
                                        ', ',
                                    )}`,
                                );
                            }

                            usedEntities.add(normalized);
                        });
                    }
                });
            }
        }

        projectData.intents = intentsConvertedForImport;
        projectData.entities = entitiesConvertedForImport;
        projectData.enabledSystemEntities = Array.from(usedEntities);

        try {
            await brain.import(projectData);
            console.log(logSymbols.success, 'Successfuly pushed!');
        } catch (error) {
            console.log(logSymbols.error, error.message);
            if (error.data) {
                console.log(logSymbols.error, error.data);
            }
        }
    });

cli.parseAsync(process.argv);
