import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, id, price } = req.body;

  if (!id || price === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    if (type === 'product') {
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { basePrice: parseFloat(price) },
      });
      return res.status(200).json(product);
    } else if (type === 'variant') {
      const recipe = await prisma.recipe.update({
        where: { id: parseInt(id) },
        data: { priceModifier: parseFloat(price) },
      });
      return res.status(200).json(recipe);
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }
  } catch (error) {
    console.error('Error updating price:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
