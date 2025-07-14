import { ALL_UNITS, MEASUREMENT_UNITS, isValidUnit, getUnitLabel, getUnitDisplayText, getUnitsByCategory, getUnitCategories, getUnitsWithCategories } from '../lib/units';

describe('Units Library', () => {
  describe('ALL_UNITS', () => {
    it('should be an array of unit objects', () => {
      expect(Array.isArray(ALL_UNITS)).toBe(true);
      expect(ALL_UNITS.length).toBeGreaterThan(0);
      
      // Check structure of first unit
      expect(ALL_UNITS[0]).toHaveProperty('value');
      expect(ALL_UNITS[0]).toHaveProperty('label');
      expect(ALL_UNITS[0]).toHaveProperty('category');
    });

    it('should contain expected unit categories', () => {
      const categories = ALL_UNITS.map(unit => unit.category);
      const uniqueCategories = [...new Set(categories)];
      
      expect(uniqueCategories).toContain('Weight');
      expect(uniqueCategories).toContain('Volume');
      expect(uniqueCategories).toContain('Count');
      expect(uniqueCategories).toContain('Coffee');
    });

    it('should contain expected weight units', () => {
      const weightUnits = ALL_UNITS.filter(unit => unit.category === 'Weight');
      const weightValues = weightUnits.map(unit => unit.value);
      
      expect(weightValues).toContain('g');
      expect(weightValues).toContain('kg');
      expect(weightValues).toContain('oz');
      expect(weightValues).toContain('lb');
    });

    it('should contain expected volume units', () => {
      const volumeUnits = ALL_UNITS.filter(unit => unit.category === 'Volume');
      const volumeValues = volumeUnits.map(unit => unit.value);
      
      expect(volumeValues).toContain('ml');
      expect(volumeValues).toContain('l');
      expect(volumeValues).toContain('cup');
      expect(volumeValues).toContain('tbsp');
      expect(volumeValues).toContain('tsp');
      expect(volumeValues).toContain('fl oz');
    });

    it('should contain expected count units', () => {
      const countUnits = ALL_UNITS.filter(unit => unit.category === 'Count');
      const countValues = countUnits.map(unit => unit.value);
      
      expect(countValues).toContain('piece');
      expect(countValues).toContain('item');
      expect(countValues).toContain('dozen');
      expect(countValues).toContain('pack');
    });

    it('should contain expected coffee-specific units', () => {
      const coffeeUnits = ALL_UNITS.filter(unit => unit.category === 'Coffee');
      const coffeeValues = coffeeUnits.map(unit => unit.value);
      
      expect(coffeeValues).toContain('shot');
      expect(coffeeValues).toContain('pump');
      expect(coffeeValues).toContain('scoop');
    });
  });

  describe('MEASUREMENT_UNITS', () => {
    it('should have correct structure', () => {
      expect(MEASUREMENT_UNITS).toHaveProperty('WEIGHT');
      expect(MEASUREMENT_UNITS).toHaveProperty('VOLUME');
      expect(MEASUREMENT_UNITS).toHaveProperty('COUNT');
      expect(MEASUREMENT_UNITS).toHaveProperty('COFFEE_SPECIFIC');
      
      expect(Array.isArray(MEASUREMENT_UNITS.WEIGHT)).toBe(true);
      expect(Array.isArray(MEASUREMENT_UNITS.VOLUME)).toBe(true);
      expect(Array.isArray(MEASUREMENT_UNITS.COUNT)).toBe(true);
      expect(Array.isArray(MEASUREMENT_UNITS.COFFEE_SPECIFIC)).toBe(true);
    });
  });

  describe('isValidUnit', () => {
    it('should return true for valid units', () => {
      expect(isValidUnit('g')).toBe(true);
      expect(isValidUnit('ml')).toBe(true);
      expect(isValidUnit('piece')).toBe(true);
      expect(isValidUnit('shot')).toBe(true);
      expect(isValidUnit('cup')).toBe(true);
    });

    it('should return false for invalid units', () => {
      expect(isValidUnit('invalid_unit')).toBe(false);
      expect(isValidUnit('xyz')).toBe(false);
      expect(isValidUnit('')).toBe(false);
      expect(isValidUnit(null)).toBe(false);
      expect(isValidUnit(undefined)).toBe(false);
      expect(isValidUnit(123)).toBe(false);
    });
  });

  describe('getUnitLabel', () => {
    it('should return correct label for valid units', () => {
      expect(getUnitLabel('g')).toBe('Grams (g)');
      expect(getUnitLabel('ml')).toBe('Milliliters (ml)');
      expect(getUnitLabel('shot')).toBe('Shots (espresso)');
      expect(getUnitLabel('pump')).toBe('Pumps (syrup)');
    });

    it('should return the input value for invalid units', () => {
      expect(getUnitLabel('invalid_unit')).toBe('invalid_unit');
      expect(getUnitLabel('')).toBe('');
      expect(getUnitLabel(null)).toBe(null);
    });
  });

  describe('getUnitDisplayText', () => {
    it('should return label when value is included in label', () => {
      expect(getUnitDisplayText('g')).toBe('Grams (g)');
      expect(getUnitDisplayText('ml')).toBe('Milliliters (ml)');
    });

    it('should return combined text when value differs significantly from label', () => {
      expect(getUnitDisplayText('shot')).toBe('Shots (espresso)');
      expect(getUnitDisplayText('pump')).toBe('Pumps (syrup)');
    });

    it('should return the input value for unknown units', () => {
      expect(getUnitDisplayText('unknown_unit')).toBe('unknown_unit');
    });
  });

  describe('getUnitsByCategory', () => {
    it('should return units for valid categories', () => {
      const weightUnits = getUnitsByCategory('Weight');
      expect(Array.isArray(weightUnits)).toBe(true);
      expect(weightUnits.length).toBeGreaterThan(0);
      expect(weightUnits.every(unit => unit.category === 'Weight')).toBe(true);

      const volumeUnits = getUnitsByCategory('Volume');
      expect(volumeUnits.every(unit => unit.category === 'Volume')).toBe(true);
    });

    it('should return empty array for invalid categories', () => {
      const invalidUnits = getUnitsByCategory('InvalidCategory');
      expect(Array.isArray(invalidUnits)).toBe(true);
      expect(invalidUnits.length).toBe(0);
    });
  });

  describe('getUnitCategories', () => {
    it('should return array of unique categories', () => {
      const categories = getUnitCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Check that categories are unique
      const uniqueCategories = [...new Set(categories)];
      expect(categories.length).toBe(uniqueCategories.length);
      
      // Check expected categories
      expect(categories).toContain('Weight');
      expect(categories).toContain('Volume');
      expect(categories).toContain('Count');
      expect(categories).toContain('Coffee');
    });
  });

  describe('getUnitsWithCategories', () => {
    it('should return array of category objects with units', () => {
      const categorizedUnits = getUnitsWithCategories();
      expect(Array.isArray(categorizedUnits)).toBe(true);
      expect(categorizedUnits.length).toBeGreaterThan(0);
      
      // Check structure
      categorizedUnits.forEach(categoryGroup => {
        expect(categoryGroup).toHaveProperty('category');
        expect(categoryGroup).toHaveProperty('units');
        expect(Array.isArray(categoryGroup.units)).toBe(true);
        expect(categoryGroup.units.length).toBeGreaterThan(0);
        
        // Check that all units in the group have the same category
        categoryGroup.units.forEach(unit => {
          expect(unit.category).toBe(categoryGroup.category);
        });
      });
    });

    it('should include all expected categories', () => {
      const categorizedUnits = getUnitsWithCategories();
      const categories = categorizedUnits.map(group => group.category);
      
      expect(categories).toContain('Weight');
      expect(categories).toContain('Volume');
      expect(categories).toContain('Count');
      expect(categories).toContain('Coffee');
    });
  });

  describe('units consistency', () => {
    it('should have unique unit values', () => {
      const values = ALL_UNITS.map(unit => unit.value);
      const uniqueValues = [...new Set(values)];
      
      expect(values.length).toBe(uniqueValues.length);
    });

    it('should have valid structure for all units', () => {
      ALL_UNITS.forEach(unit => {
        expect(typeof unit.value).toBe('string');
        expect(typeof unit.label).toBe('string');
        expect(typeof unit.category).toBe('string');
        expect(unit.value.length).toBeGreaterThan(0);
        expect(unit.label.length).toBeGreaterThan(0);
        expect(unit.category.length).toBeGreaterThan(0);
      });
    });
  });
});
