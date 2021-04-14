import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { AssistantCharacterType, createAssistant, createSmartappDebugger } from '@sberdevices/assistant-client';
import { DeviceThemeProvider } from '@sberdevices/plasma-ui/components/Device';
import {
    Container,
    Row,
    Col,
    Card,
    CardContent,
    Cell,
    CellIcon,
    TextBox,
    TextBoxTitle,
    TextBoxSubTitle,
    ActionButton,
    Button,
} from '@sberdevices/plasma-ui';
import { Icon } from '@sberdevices/plasma-icons';
import debounce from 'debounce';

import { GlobalStyles } from '../Components/GlobalStyles';

if (process.browser) {
    // @ts-ignore
    import('@sberdevices/spatial-navigation');
}

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const NEXT_PUBLIC_DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN;
const NEXT_PUBLIC_DEV_PHRASE = process.env.NEXT_PUBLIC_DEV_PHRASE;

interface Product {
    name: string;
    price: number;
    code: string;
}

interface CartItem {
    position_id: number;
    name: string;
    item_price: number;
    item_amount: number;
    item_code: string;
    quantity: {
        value: number;
        measure: string;
    };
    currency: 'RUB';
    tax_type: number;
    tax_sum: number;
}

interface Cart {
    items: Array<CartItem>;
    amount: number;
    tax_system: 0;
    currency: 'RUB';
}

const items: Array<Product> = [
    { name: 'Сладкий сет', price: 100, code: 'sweet' },
    { name: 'Сырный сет', price: 200, code: 'cheese' },
    { name: 'Солёный сет', price: 300, code: 'salty' },
];

const StyledTextBox = styled(TextBox)`
    margin: 0 1rem;
`;

const IndexPage = () => {
    const assistantRef = useRef<any>();
    const [character, setCharacter] = useState<AssistantCharacterType>('sber' as const);
    const [cartItems, setCartItems] = useState<Record<string, CartItem>>({});
    const [sum, setSum] = useState<number>(0);

    useEffect(() => {
        const initializeAssistant = () => {
            if (!IS_DEVELOPMENT) {
                return createAssistant({
                    getState: () => ({}),
                });
            }

            if (!NEXT_PUBLIC_DEV_TOKEN || !NEXT_PUBLIC_DEV_PHRASE) {
                throw new Error('');
            }

            return createSmartappDebugger({
                token: NEXT_PUBLIC_DEV_TOKEN,
                initPhrase: NEXT_PUBLIC_DEV_PHRASE,
                getState: () => ({}),
            });
        };

        const assistant = initializeAssistant();

        assistant.on('data', (command) => {
            switch (command.type) {
                case 'character':
                    setCharacter(command.character.id);
                    // 'sber' | 'eva' | 'joy';
                    break;
                case 'navigation':
                    break;
                case 'smart_app_data':
                    break;
                default:
                    break;
            }
        });

        assistantRef.current = assistant;
    }, []);

    const handlePay = () => {
        const cart: Cart = {
            items: Object.keys(cartItems).map((code, index) => ({ ...cartItems[code], position_id: index + 1 })),
            amount: sum,
            tax_system: 0,
            currency: 'RUB',
        };

        assistantRef.current.sendAction({ type: 'PAY_DIALOG_INIT', payload: cart });
    };

    const createCountChangeHandler = (item: Product, decrement?: boolean) =>
        debounce(() => {
            setCartItems((old) => {
                const current = { ...old };

                if (typeof current[item.code] === 'undefined') {
                    if (decrement) {
                        return old;
                    }

                    current[item.code] = {
                        position_id: 0,
                        name: item.name,
                        item_price: item.price,
                        item_amount: item.price,
                        item_code: item.code,
                        quantity: {
                            value: 1,
                            measure: 'шт.',
                        },
                        currency: 'RUB',
                        tax_type: 0,
                        tax_sum: 0,
                    };
                } else {
                    const count = current[item.code].quantity.value + (decrement ? -1 : +1);

                    if (count < 1) {
                        delete current[item.code];
                    } else {
                        current[item.code] = {
                            ...current[item.code],
                            item_amount: item.price * count,
                            quantity: {
                                ...current[item.code].quantity,
                                value: count,
                            },
                        };
                    }
                }

                return current;
            });
        }, 50);

    useEffect(() => {
        let newSum = 0;
        Object.keys(cartItems).forEach((itemCode) => {
            const { item_amount } = cartItems[itemCode];

            newSum += item_amount;
        });

        setSum(newSum);
    }, [cartItems]);

    return (
        <DeviceThemeProvider>
            <GlobalStyles character={character} />
            <Container style={{ margin: '3rem 0' }}>
                <Row>
                    {items.map((product) => (
                        <Col size={8} style={{ marginBottom: '1rem' }} key={`product-${product.code}`}>
                            <Card>
                                <CardContent>
                                    <Cell
                                        contentLeft={
                                            <CellIcon>
                                                <Image src="/popcorn.png" alt="" width={64} height={64} />
                                            </CellIcon>
                                        }
                                        content={
                                            <TextBox>
                                                <TextBoxTitle>{product.name}</TextBoxTitle>
                                                <TextBoxSubTitle>{product.price / 100} р.</TextBoxSubTitle>
                                            </TextBox>
                                        }
                                        contentRight={
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <ActionButton
                                                    onClick={createCountChangeHandler(product, true)}
                                                    pin="circle-circle"
                                                >
                                                    <Icon icon="minus" />
                                                </ActionButton>
                                                <StyledTextBox
                                                    title={(cartItems[product.code]?.quantity.value || 0).toString()}
                                                />
                                                <ActionButton
                                                    onClick={createCountChangeHandler(product, false)}
                                                    pin="circle-circle"
                                                >
                                                    <Icon icon="plus" />
                                                </ActionButton>
                                            </div>
                                        }
                                    />
                                </CardContent>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Row style={{ marginTop: '3rem' }}>
                    <Col size={8}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TextBox title={`Сумма заказа: ${sum / 100} р.`} />
                            <Button size="s" view="primary" disabled={sum < 1} onClick={handlePay}>
                                Оплатить
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </DeviceThemeProvider>
    );
};

export default IndexPage;

// 1. На фронте добавить две кнопка с ценой 1Р и 2Р и степпер под ними
// 2. На фронте нарисовать текущую корзину
// 3. Кнопка оплатить, которая прокидывает на бэк корзину
// 4. На бэке по честному завести инвойс с корзиной
// 5. Прикрутить спатнав
// 6. Поправить баг с асинхронным диспатчем
// 7. Катнуть на версель
// 8. Указать пути до верселя в приложении в студии
// 9. Поделиться для теста
// 10. Релизнуть @salutejs/payments, переименовать @salutejs=>@sberdevices
