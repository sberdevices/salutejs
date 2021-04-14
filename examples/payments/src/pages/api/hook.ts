import { NextApiRequest, NextApiResponse } from 'next';
import {
    createIntents,
    createUserScenario,
    createSystemScenario,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
    createMatchers,
    SaluteHandler,
    SaluteRequest,
    SaluteRequestVariable,
    AppState,
    PaymentInvoice,
    TaxSystemTypes,
    Currency,
    createInvoice,
    PayDialogFinishedServerAction,
    PayDialogStatuses,
} from '@salutejs/scenario';

interface PayDialogInitSA {
    type: 'PAY_DIALOG_INIT';
    payload: {
        items: PaymentInvoice['order']['order_bundle'];
        amount: number;
        tax_system: TaxSystemTypes;
        currency: Currency;
    };
}

const { action } = createMatchers();

const payDialogFinished: SaluteHandler = ({ req, res }) => {
    const { parameters } = (req.serverAction as unknown) as PayDialogFinishedServerAction;
    if (parameters.payment_response.response_code === PayDialogStatuses.success) {
        res.setPronounceText('Оплачено');
    } else {
        res.setPronounceText(`Ошибка ${parameters.payment_response.response_code}`);
    }
};

const payDialogInit: SaluteHandler<SaluteRequest<SaluteRequestVariable, AppState, PayDialogInitSA>> = async ({
    req,
    res,
}) => {
    if (!req.serverAction) {
        return;
    }

    const { items, amount, currency, tax_system } = req.serverAction?.payload;

    const { invoice_id } = await createInvoice({
        invoice: {
            order: {
                order_id: new Date().getTime().toString(),
                order_date: `${new Date().toISOString().split('.')[0]}+03:00`,
                currency,
                language: 'ru-RU',
                service_id: process.env.PAYMENT_SERVICE_ID || '',
                purpose: 'УКАЖИТЕ ПРОДАВЦА',
                description: 'Заказ воды',
                amount,
                tax_system,
                order_bundle: [...items],
            },
        },
    });

    res.askPayment(invoice_id || 0);
};

const systemScenario = createSystemScenario({
    PAY_DIALOG_FINISHED: payDialogFinished,
});

const userScenario = createUserScenario({
    PAY_DIALOG_START: {
        match: action('PAY_DIALOG_INIT'),
        // @ts-ignore
        handle: payDialogInit,
    },
});

const scenarioWalker = createScenarioWalker({
    intents: createIntents({}),
    systemScenario,
    userScenario,
});

// const storage = new SaluteMemoryStorage();

const session = {
    path: [],
    variables: {},
    slotFilling: false,
    state: {},
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
    const req = createSaluteRequest(request.body);
    const res = createSaluteResponse(request.body);

    // const sessionId = body.uuid.userId;
    // const session = await storage.resolve(sessionId);

    await scenarioWalker({ req, res, session });
    // await storage.save({ id: sessionId, session });

    response.status(200).json(res.message);
};
