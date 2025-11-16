// Simple test to validate AddIngredientDialog syntax
const { ALL_UNITS, MEASUREMENT_UNITS } = require("./lib/units.js");

console.log("Units import test:");
console.log("ALL_UNITS count:", ALL_UNITS.length);
console.log("First unit:", ALL_UNITS[0]);
console.log("Sample units:", ALL_UNITS.slice(0, 5));

// Test the structure
const sampleUnit = ALL_UNITS[0];
console.log("Sample unit structure:", {
  value: sampleUnit.value,
  label: sampleUnit.label,
  category: sampleUnit.category
});
