import { PermittedSystemEntitiesType } from './permittedSystemEntities';
import { SmartAppBrainRecognizer } from './smartAppBrain';
import { convertIntentsForImport, getIntentsFromResponse } from './smartAppBrainSync';

const brain = new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN);

brain
    .export()
    .then((data) => {
        const intentsFromResponse = getIntentsFromResponse(data);
        const intentsConvertedForImport = convertIntentsForImport(intentsFromResponse);
        const enabledSystemEntities: PermittedSystemEntitiesType = ['duckling.number', 'duckling.date'];
        data.intents = intentsConvertedForImport;
        data.enabledSystemEntities = enabledSystemEntities;

        const intent = data.intents.find((e) => {
            return e.path === '/SlotFillingIntent';
        });

        intent.phrases.push({
            text: 'Антоша лапушка',
            entities: [],
            stagedPhraseIdx: null,
        });

        return brain.import(data);
    })
    .then((d) => {
        console.log(d);
    });
