-- Insert some test products
INSERT INTO "Product" (id, name, category) VALUES 
(1, 'Cappuccino', 'Espresso'),
(2, 'Latte', 'Espresso'),
(3, 'Americano', 'Coffee'),
(4, 'Croissant', 'Pastry'),
(5, 'Espresso', 'Espresso');

-- Insert some test ingredients (if they don't exist)
INSERT INTO "Ingredient" (id, name, unit, "costPerUnit", "currentStock", "wastePercentage") VALUES 
(1, 'Espresso Shot', 'ml', 0.15, 1000.0, 0.05),
(2, 'Milk', 'ml', 0.002, 5000.0, 0.02),
(3, 'Foam', 'ml', 0.001, 2000.0, 0.10),
(4, 'Water', 'ml', 0.001, 10000.0, 0.01),
(5, 'Sugar', 'g', 0.01, 500.0, 0.05)
ON CONFLICT (id) DO NOTHING;

-- Insert some test recipes
INSERT INTO "Recipe" (id, "productId", variant) VALUES 
(1, 1, 'Regular'),
(2, 1, 'Decaf'),
(3, 2, 'Regular'),
(4, 3, 'Regular'),
(5, 5, 'Double Shot');

-- Insert recipe ingredients
INSERT INTO "RecipeIngredient" (id, "recipeId", "ingredientId", quantity) VALUES 
-- Cappuccino Regular
(1, 1, 1, 30.0),  -- 30ml espresso
(2, 1, 2, 120.0), -- 120ml milk
(3, 1, 3, 60.0),  -- 60ml foam

-- Cappuccino Decaf  
(4, 2, 1, 30.0),  -- 30ml espresso (decaf)
(5, 2, 2, 120.0), -- 120ml milk
(6, 2, 3, 60.0),  -- 60ml foam

-- Latte Regular
(7, 3, 1, 30.0),  -- 30ml espresso
(8, 3, 2, 180.0), -- 180ml milk
(9, 3, 3, 30.0),  -- 30ml foam

-- Americano Regular
(10, 4, 1, 60.0), -- 60ml espresso
(11, 4, 4, 120.0), -- 120ml water

-- Espresso Double Shot
(12, 5, 1, 60.0); -- 60ml espresso
