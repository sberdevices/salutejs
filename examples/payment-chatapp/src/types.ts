import { Currency, PaymentInvoice, TaxSystemTypes, SaluteRequestVariable, AppState } from '@salutejs/scenario';

export interface PayDialogInitSA {
    type: 'PAY_DIALOG_INIT';
    payload: {
        items: PaymentInvoice['order']['order_bundle'];
        amount: number;
        tax_system: TaxSystemTypes;
        currency: Currency;
    };
}

export interface Product {
    code: string;
    title: string;
    image: string;
    price: number;
    synonyms: Array<string>;
}

export interface ProductVariable extends SaluteRequestVariable {
    product: string;
}

export interface PaymentState extends AppState {
    cart?: Record<string, number>;
    bundle?: PaymentInvoice['order']['order_bundle'];
}
