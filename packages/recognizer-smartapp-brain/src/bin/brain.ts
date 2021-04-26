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
import { convertIntentsForImport, getIntentsFromResponse } from '../lib/smartAppBrainSync';
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

        await promises.writeFile(intentsDictPath, JSON.stringify(intentsFromResponse, null, 2));
        console.log(logSymbols.success, 'Successfuly updated!');
    });

cli.command('push')
    .option('-t, --token <token>', 'SmartApp Brain access token', process.env.SMARTAPP_BRAIN_TOKEN)
    .option('-p, --path <path>', 'Path to intents dictionary file', 'src/intents.json')
    .action(async ({ token, path }) => {
        const brain = new SmartAppBrainRecognizer(token);
        const intentsDictPath = join(process.cwd(), path);
        const projectData = await brain.export();
        const intentsFromFS: IntentsDict = require(intentsDictPath);
        const intentsConvertedForImport = convertIntentsForImport(intentsFromFS);

        const usedEntities = new Set<string>();
        for (const intent of Object.values(intentsFromFS)) {
            const matchers = intent.matchers || [];
            matchers.forEach((phrase) => {
                const matched = phrase.match(/@[a-zA-Z0-9._-]+/gi);
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

        projectData.intents = intentsConvertedForImport;
        projectData.enabledSystemEntities = Array.from(usedEntities);

        await brain.import(projectData);
        console.log(logSymbols.success, 'Successfuly pushed!');
    });

cli.parseAsync(process.argv);
