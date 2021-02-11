import { Scenario } from './scenario';

describe('@salutejs/scenario', () => {
    describe('intents', () => {
        test('add', () => {
            const scenario = new Scenario();
            scenario.addIntent('intent');

            expect(scenario.getIntent('intent')).toMatchObject({
                id: 'intent',
                transitions: {},
            });
        });

        test('add spread', () => {
            const scenario = new Scenario();
            scenario.addIntent('intent', 'one more');

            expect(scenario.getIntent('intent')).toMatchObject({
                id: 'intent',
                transitions: {},
            });

            expect(scenario.getIntent('one more')).toMatchObject({
                id: 'one more',
                transitions: {},
            });
        });

        test('falls on existing intent', () => {
            const scenario = new Scenario();
            scenario.addIntent('from', 'to');

            expect(() => {
                scenario.addIntent('from');
            }).toThrow('Intent "from" already exists ¯\\_(ツ)_/¯"');
        });
    });

    describe('transitions', () => {
        test('add', () => {
            const scenario = new Scenario();
            scenario.addIntent('from', 'to');
            scenario.addTransition(['from', 'to']);

            expect(scenario.getIntent('from')).toMatchObject({
                id: 'from',
                transitions: {
                    to: true,
                },
            });
        });

        test('falls on unexisted intent', () => {
            const scenario = new Scenario();
            scenario.addIntent('from');

            expect(() => {
                scenario.addTransition(['from', 'unexisted']);
            }).toThrow('Intent "unexisted" doesn\'t exists ¯\\_(ツ)_/¯"');
        });

        test('get', () => {
            const scenario = new Scenario();
            scenario.addIntent('from', 'to');
            scenario.addTransition(['from', 'to']);

            expect(scenario.getTransition('from', 'to')).toEqual(true);
            expect(scenario.getTransition('to', 'from')).toEqual(undefined);
        });
    });
});
