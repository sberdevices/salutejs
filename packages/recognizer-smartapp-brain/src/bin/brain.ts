#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */

import { join } from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';
import { Command } from 'commander';
import logSymbols from 'log-symbols';
import { IntentsDict } from '@salutejs/types';

import { permittedSystemEntites } from '../lib/permittedSystemEntities';
import { convertIntentsForImport, getIntentsFromResponse } from '../lib/smartAppBrainSync';
import { SmartAppBrainRecognizer } from '../lib';

const writeFileAsync = promisify(writeFile);
const cli = new Command();

cli.command('pull')
    .option('-t, --token <token>', 'SmartApp Brain access token', process.env.TOKEN)
    .option('-p, --path <path>', 'Path to intents dictionary file', 'src/intents.json')
    .action(async ({ token, path }) => {
        const brain = new SmartAppBrainRecognizer(token);
        const intentsDictPath = join(process.cwd(), path);
        const projectData = await brain.export();
        const intentsFromResponse = getIntentsFromResponse(projectData);

        await writeFileAsync(intentsDictPath, JSON.stringify(intentsFromResponse, null, 2));
        console.log(logSymbols.success, 'Successfuly updated!');
    });

cli.command('push')
    .option('-t, --token <token>', 'SmartApp Brain access token', process.env.TOKEN)
    .option('-p, --path <path>', 'Path to intents dictionary file', 'src/intents.json')
    .action(async ({ token, path }) => {
        const brain = new SmartAppBrainRecognizer(token);
        const intentsDictPath = join(process.cwd(), path);
        const projectData = await brain.export();
        const intentsFromFS: IntentsDict = require(intentsDictPath);
        const intentsConvertedForImport = convertIntentsForImport(intentsFromFS);

        const usedEntities = new Set<string>();
        for (const [, value] of Object.entries(intentsFromFS)) {
            const matchers = value.matchers || [];
            matchers.forEach((phrase) => {
                const matched = phrase.match(/@[a-zA-Z0-9._-]+/gi);
                matched &&
                    matched.forEach((entitity) => {
                        const normalized = entitity.replace('@', '');
                        if (!permittedSystemEntites.includes(normalized as any)) {
                            throw new Error(`Non system entity. Alowed: ${permittedSystemEntites.join(', ')}`);
                        }

                        usedEntities.add(normalized);
                    });
            });
        }

        projectData.intents = intentsConvertedForImport;
        projectData.enabledSystemEntities = Array.from(usedEntities);

        await brain.import(projectData);
        console.log(logSymbols.success, 'Successfuly pushed!');
    });

cli.parseAsync(process.argv);
