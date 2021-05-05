import { GalleryCard, GalleryItem, LeftRightCellView, ListCard, PaymentInvoice } from '@salutejs/scenario';
import assert from 'assert';

import { Product } from './types';

export const createGalleryCard = (products: Array<Product>): GalleryCard => {
    assert(products.length >= 1);

    return {
        type: 'gallery_card',
        items: products.map(
            (product): GalleryItem => ({
                type: 'media_gallery_item',
                image: {
                    url: product.image,
                    size: {
                        width: 'small',
                        aspect_ratio: 1,
                    },
                },
                margins: {
                    top: '4x',
                    left: '6x',
                    right: '6x',
                    bottom: '5x',
                },
                bottom_text: {
                    text: `${product.price / 100} р`,
                    typeface: 'caption',
                    text_color: 'secondary',
                    max_lines: 1,
                    margins: {
                        top: '2x',
                    },
                },
                top_text: {
                    text: product.title,
                    typeface: 'footnote1',
                    text_color: 'default',
                    max_lines: 2,
                },
            }),
        ) as [GalleryItem, ...GalleryItem[]],
    };
};

export const createOrderBundle = (bundle: PaymentInvoice['order']['order_bundle']): ListCard => {
    return {
        type: 'list_card',
        paddings: {
            top: '9x',
            bottom: '12x',
            left: '8x',
            right: '8x',
        },
        cells: [
            {
                type: 'text_cell_view',
                content: {
                    text: 'Корзина',
                    typeface: 'headline3',
                    text_color: 'default',
                },
                paddings: {
                    bottom: '2x',
                },
            },
            ...bundle.map(
                (item): LeftRightCellView => ({
                    type: 'left_right_cell_view',
                    paddings: {
                        top: '6x',
                        bottom: '6x',
                    },
                    divider: {
                        style: 'default',
                        size: 'd1',
                    },
                    left: {
                        type: 'simple_left_view',
                        texts: {
                            title: {
                                text: item.name,
                                typeface: 'caption',
                                text_color: 'default',
                                max_lines: 0,
                            },
                            subtitle: {
                                text: `${item.quantity.value} ${item.quantity.measure}`,
                                typeface: 'caption',
                                text_color: 'secondary',
                                max_lines: 0,
                            },
                        },
                    },
                    right: {
                        type: 'detail_right_view',
                        detail: {
                            text: `${item.item_amount / 100} р`,
                            typeface: 'footnote2',
                            text_color: 'default',
                            max_lines: 0,
                        },
                    },
                }),
            ),
            {
                type: 'left_right_cell_view',
                paddings: {
                    top: '10x',
                },
                left: {
                    type: 'simple_left_view',
                    texts: {
                        title: {
                            text: 'Итого',
                            typeface: 'footnote1',
                            text_color: 'secondary',
                        },
                    },
                },
                right: {
                    type: 'detail_right_view',
                    detail: {
                        text: `${bundle.reduce((acc, item) => acc + item.item_amount, 0) / 100} р`,
                        typeface: 'footnote2',
                        text_color: 'default',
                        max_lines: 0,
                    },
                },
            },
        ],
    };
};
