import { createMocks } from 'node-mocks-http';
import productHandler from '../pages/api/products/index';
import orderHandler from '../pages/api/orders/index';
import extraHandler from '../pages/api/extras/index';
import prisma from '../lib/prisma';

describe('Variants and Extras Integration', () => {
    let createdProductId;
    let createdExtraId;
    let createdUserId;
    let createdClientId;

    beforeAll(async () => {
        // Create a test user and client
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: `test-${Date.now()}@example.com`,
                password: 'password',
                role: 'BARISTA',
            },
        });
        createdUserId = user.id;

        const client = await prisma.client.create({
            data: {
                client_number: `C-${Date.now()}`,
                name: 'Test Client',
                application_used: 'test',
            },
        });
        createdClientId = client.id;
    });

    afterAll(async () => {
        // Cleanup
        if (createdProductId) {
            await prisma.product.delete({ where: { id: createdProductId } }).catch(() => { });
        }
        if (createdExtraId) {
            await prisma.extra.delete({ where: { id: createdExtraId } }).catch(() => { });
        }
        if (createdUserId) {
            await prisma.user.delete({ where: { id: createdUserId } }).catch(() => { });
        }
        if (createdClientId) {
            await prisma.client.delete({ where: { id: createdClientId } }).catch(() => { });
        }
    });

    test('should create a product with variants', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                name: 'Test Latte',
                category: 'Coffee',
                basePrice: 5.0,
                variantGroups: [
                    {
                        name: 'Milk',
                        options: [
                            { name: 'Whole', priceAdjustment: 0 },
                            { name: 'Oat', priceAdjustment: 0.5 },
                        ],
                    },
                ],
            },
        });

        await productHandler(req, res);

        expect(res._getStatusCode()).toBe(201);
        const product = JSON.parse(res._getData());
        createdProductId = product.id;

        expect(product.name).toBe('Test Latte');
        expect(product.variantGroups).toHaveLength(1);
        expect(product.variantGroups[0].name).toBe('Milk');
        expect(product.variantGroups[0].options).toHaveLength(2);
    });

    test('should create an extra', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                name: 'Caramel Syrup',
                price: 0.5,
            },
        });

        await extraHandler(req, res);

        expect(res._getStatusCode()).toBe(201);
        const extra = JSON.parse(res._getData());
        createdExtraId = extra.id;

        expect(extra.name).toBe('Caramel Syrup');
        expect(extra.price).toBe(0.5);
    });

    test('should create an order with variants and extras', async () => {
        // Fetch the product to get variant option IDs
        const product = await prisma.product.findUnique({
            where: { id: createdProductId },
            include: { variantGroups: { include: { options: true } } },
        });
        const oatOption = product.variantGroups[0].options.find(o => o.name === 'Oat');

        const { req, res } = createMocks({
            method: 'POST',
            body: {
                client: { client_number: 'C-TEST' }, // Should use existing or create new
                userId: createdUserId,
                products: [
                    {
                        productId: createdProductId,
                        quantity: 1,
                        unitPrice: 6.0, // Base 5 + Oat 0.5 + Caramel 0.5
                        selectedVariants: [
                            { id: oatOption.id, priceAdjustment: 0.5 },
                        ],
                        selectedExtras: [
                            { id: createdExtraId, price: 0.5 },
                        ],
                    },
                ],
                total: 6.0,
            },
        });

        await orderHandler(req, res);

        expect(res._getStatusCode()).toBe(201);
        const order = JSON.parse(res._getData());

        expect(order.products).toHaveLength(1);
        const orderProduct = order.products[0];

        expect(orderProduct.selectedVariants).toHaveLength(1);
        expect(orderProduct.selectedVariants[0].variantOption.name).toBe('Oat');
        expect(orderProduct.selectedVariants[0].priceAtOrder).toBe(0.5);

        expect(orderProduct.selectedExtras).toHaveLength(1);
        expect(orderProduct.selectedExtras[0].extra.name).toBe('Caramel Syrup');
        expect(orderProduct.selectedExtras[0].priceAtOrder).toBe(0.5);
    });
});
