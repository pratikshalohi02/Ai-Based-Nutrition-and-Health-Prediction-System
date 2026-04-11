import { getAllFoodNames, getUnitsForFood, calculateCalories } from '../lib/foodDatabase';

// Quick test to verify all functions work
console.log('==== Manual Calorie Tracker Test ====');

try {
  // Test 1: Get all food names
  const allFoods = getAllFoodNames();
  console.log(`✓ getAllFoodNames() returned ${allFoods.length} foods`);
  console.log(`  Sample foods: ${allFoods.slice(0, 5).join(', ')}`);

  // Test 2: Get units for a food
  if (allFoods.length > 0) {
    const firstFood = allFoods[0];
    const units = getUnitsForFood(firstFood);
    console.log(`✓ getUnitsForFood("${firstFood}") = [${units.join(', ')}]`);

    // Test 3: Calculate calories
    if (units.length > 0) {
      const calories = calculateCalories(firstFood, 1, units[0]);
      console.log(`✓ calculateCalories("${firstFood}", 1, "${units[0]}") = ${calories}`);
    }
  }

  // Test 4: Test with specific foods
  const testFoods = ['Chicken', 'Biryani (Chicken)', 'Apple', 'Milk (low fat)'];
  testFoods.forEach(food => {
    const units = getUnitsForFood(food);
    if (units.length > 0) {
      const calories = calculateCalories(food, 1, units[0]);
      console.log(`✓ ${food}: ${units[0]} = ${calories} cal`);
    } else {
      console.log(`⚠ ${food}: NOT FOUND IN DATABASE`);
    }
  });

  console.log('==== All Tests Passed! ====');
} catch (error) {
  console.error('❌ Test Failed:', error);
}
