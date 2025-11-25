import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                // Get all categories with product count
                const categories = await prisma.category.findMany({
                    orderBy: { name: 'asc' },
                    include: {
                        _count: {
                            select: {
                                products: true,
                                extras: true
                            }
                        }
                    }
                });

                res.status(200).json({ categories });
                break;

            case 'POST':
                // Create new category
                const { name } = req.body;

                if (!name || name.trim() === '') {
                    return res.status(400).json({ error: 'Category name is required' });
                }

                try {
                    const category = await prisma.category.create({
                        data: { name: name.trim() }
                    });

                    res.status(201).json(category);
                } catch (error) {
                    if (error.code === 'P2002') {
                        return res.status(409).json({ error: 'Category already exists' });
                    }
                    throw error;
                }
                break;

            case 'PUT':
                // Update category
                const { id, name: newName } = req.body;

                if (!id || !newName) {
                    return res.status(400).json({ error: 'Category ID and name are required' });
                }

                const updatedCategory = await prisma.category.update({
                    where: { id: parseInt(id) },
                    data: { name: newName.trim() }
                });

                res.status(200).json(updatedCategory);
                break;

            case 'DELETE':
                // Delete category (only if no products)
                const { id: deleteId } = req.body;

                if (!deleteId) {
                    return res.status(400).json({ error: 'Category ID is required' });
                }

                // Check if category has products or extras
                const productCount = await prisma.product.count({
                    where: { categoryId: parseInt(deleteId) }
                });

                const extraCount = await prisma.extra.count({
                    where: { categoryId: parseInt(deleteId) }
                });

                if (productCount > 0 || extraCount > 0) {
                    return res.status(400).json({
                        error: `Cannot delete category with ${productCount} products and ${extraCount} extras`
                    });
                }

                await prisma.category.delete({
                    where: { id: parseInt(deleteId) }
                });

                res.status(200).json({ message: 'Category deleted successfully' });
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).json({ error: `Method ${method} Not Allowed` });
        }
    } catch (error) {
        console.error('Categories API error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
