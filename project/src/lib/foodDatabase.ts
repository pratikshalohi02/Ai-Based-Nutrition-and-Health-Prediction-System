// Food database with multiple unit options
export const FOOD_DATABASE = {
  // Fruits
  fruits: {
    Apple: {
      units: { piece: 95, '100g': 52, gram: 0.52, slice: 48 }
    },
    Banana: {
      units: { piece: 105, '100g': 89, gram: 0.89, slice: 45 }
    },
    Orange: {
      units: { piece: 85, '100g': 47, gram: 0.47, cup: 85 }
    },
    Grapes: {
      units: { '100g': 67, gram: 0.67, cup: 110, handful: 80 }
    },
    Berries: {
      units: { '100g': 32, gram: 0.32, cup: 80, handful: 50 }
    },
    Mango: {
      units: { piece: 135, cup: 99, '100g': 60, gram: 0.60, slice: 45 }
    },
    Watermelon: {
      units: { '100g': 46, cup: 60, gram: 0.46, slice: 140 }
    },
    Papaya: {
      units: { '100g': 43, cup: 110, gram: 0.43, slice: 60 }
    },
    Guava: {
      units: { piece: 68, '100g': 68, gram: 0.68, cup: 110 }
    },
    Pineapple: {
      units: { '100g': 82, gram: 0.82, cup: 165, slice: 42 }
    },
    Strawberry: {
      units: { '100g': 32, gram: 0.32, cup: 50, piece: 4 }
    },
  },
  // Vegetables
  vegetables: {
    Broccoli: {
      units: { '100g': 55, gram: 0.55, cup: 55, handful: 35 }
    },
    Spinach: {
      units: { '100g': 23, gram: 0.23, cup: 7, handful: 20 }
    },
    Carrots: {
      units: { '100g': 41, gram: 0.41, piece: 25, cup: 55, stick: 15 }
    },
    Tomato: {
      units: { piece: 18, '100g': 18, gram: 0.18, cup: 40, slice: 3 }
    },
    Cucumber: {
      units: { '100g': 16, gram: 0.16, piece: 45, cup: 40, slice: 5 }
    },
    Onion: {
      units: { '100g': 40, gram: 0.40, piece: 44, cup: 64, tbsp: 7 }
    },
    Potato: {
      units: { piece: 77, '100g': 77, gram: 0.77, cup: 110, tbsp: 15 }
    },
    'Bell Pepper': {
      units: { piece: 31, '100g': 31, gram: 0.31, cup: 30, tbsp: 4 }
    },
  },
  // Grains & Bread
  grains: {
    'White Rice': {
      units: { 'cup cooked': 206, gram: 0.28, tbsp: 10, '100g': 28 }
    },
    'Brown Rice': {
      units: { 'cup cooked': 215, gram: 0.30, tbsp: 11, '100g': 30 }
    },
    Bread: {
      units: { slice: 79, '100g': 265, gram: 2.65, tbsp: 20 }
    },
    Chapati: {
      units: { piece: 70, '100g': 155, gram: 1.55, tbsp: 12 }
    },
    'Naan Bread': {
      units: { piece: 300, '100g': 300, gram: 3.00, tbsp: 30 }
    },
  },
  // Proteins
  proteins: {
    Chicken: {
      units: { '100g': 165, gram: 1.65, piece: 82, kg: 1650, oz: 46, tbsp: 25 }
    },
    Fish: {
      units: { '100g': 120, gram: 1.20, piece: 60, kg: 1200, oz: 34, tbsp: 18 }
    },
    Eggs: {
      units: { piece: 78, '100g': 155, gram: 1.55, oz: 43 }
    },
    Tofu: {
      units: { '100g': 76, gram: 0.76, piece: 95, cup: 180, oz: 21 }
    },
  },
  // Dairy
  dairy: {
    'Milk (low fat)': {
      units: { cup: 100, ml: 20, liter: 200, tbsp: 10, glass: 150 }
    },
    Yogurt: {
      units: { '150ml': 100, cup: 200, tbsp: 15, gram: 0.67 }
    },
    Cheese: {
      units: { '30g': 110, gram: 3.67, piece: 110, slice: 80, oz: 104 }
    },
  },
  // Indian Dishes - Expanded
  indianDishes: {
    // Biryani & Rice Dishes
    'Biryani (Chicken)': {
      units: { cup: 280, plate: 560, serving: 350, tbsp: 25, gram: 2.8 }
    },
    'Biryani (Mutton)': {
      units: { cup: 320, plate: 640, serving: 400, tbsp: 28, gram: 3.2 }
    },
    'Biryani (Vegetable)': {
      units: { cup: 220, plate: 440, serving: 280, tbsp: 20, gram: 2.2 }
    },
    'Biryani (Fish)': {
      units: { cup: 240, plate: 480, serving: 300, tbsp: 22, gram: 2.4 }
    },
    'Fried Rice (Indian)': {
      units: { cup: 240, plate: 350, serving: 240, tbsp: 18, gram: 2.4 }
    },
    'Pulao (Chicken)': {
      units: { cup: 260, serving: 260, plate: 520, tbsp: 22, gram: 2.6 }
    },
    'Pulao (Vegetable)': {
      units: { cup: 200, serving: 200, plate: 400, tbsp: 18, gram: 2.0 }
    },

    // Curries & Gravies
    'Butter Chicken': {
      units: { cup: 220, serving: 220, plate: 440, tbsp: 18, spoon: 25 }
    },
    'Butter Paneer': {
      units: { cup: 240, serving: 240, plate: 480, tbsp: 20, spoon: 27 }
    },
    'Chicken Tikka Masala': {
      units: { cup: 240, serving: 240, plate: 480, tbsp: 20, spoon: 27 }
    },
    'Paneer Tikka Masala': {
      units: { cup: 260, serving: 260, plate: 520, tbsp: 22, spoon: 29 }
    },
    'Chicken Curry': {
      units: { cup: 180, serving: 180, plate: 360, tbsp: 15, spoon: 20 }
    },
    'Mutton Curry': {
      units: { cup: 220, serving: 220, plate: 440, tbsp: 18, spoon: 25 }
    },
    'Fish Curry': {
      units: { cup: 200, serving: 200, plate: 400, tbsp: 17, spoon: 22 }
    },
    'Prawn Curry': {
      units: { cup: 180, serving: 180, plate: 360, tbsp: 15, spoon: 20 }
    },
    'Crab Curry': {
      units: { cup: 240, serving: 240, plate: 480, tbsp: 20, spoon: 27 }
    },
    'Lamb Curry': {
      units: { cup: 240, serving: 240, plate: 480, tbsp: 20, spoon: 27 }
    },

    // Vegetarian Curries
    'Dal Makhani': {
      units: { cup: 200, serving: 200, plate: 400, tbsp: 17, bowl: 200 }
    },
    'Dal Tadka': {
      units: { cup: 160, serving: 160, plate: 320, tbsp: 14, bowl: 160 }
    },
    'Chana Masala': {
      units: { cup: 180, serving: 180, plate: 360, tbsp: 15, bowl: 180 }
    },
    'Rajma (Kidney Beans)': {
      units: { cup: 170, serving: 170, plate: 340, tbsp: 14, bowl: 170 }
    },
    'Palak Paneer': {
      units: { cup: 200, serving: 200, plate: 400, tbsp: 17, spoon: 22 }
    },
    'Palak (Spinach) Curry': {
      units: { cup: 120, serving: 120, plate: 240, tbsp: 10, spoon: 13 }
    },
    'Aloo Gobi': {
      units: { cup: 140, serving: 140, plate: 280, tbsp: 12, spoon: 15 }
    },
    'Baingan Bharta': {
      units: { cup: 120, serving: 120, plate: 240, tbsp: 10, spoon: 13 }
    },
    'Mixed Vegetable Curry': {
      units: { cup: 130, serving: 130, plate: 260, tbsp: 11, spoon: 14 }
    },
    'Navratan Korma': {
      units: { cup: 220, serving: 220, plate: 440, tbsp: 18, spoon: 25 }
    },
    'Kashmiri Paneer': {
      units: { cup: 240, serving: 240, plate: 480, tbsp: 20, spoon: 27 }
    },

    // Indulgent Gravies
    'Nirvana (Rich Gravy)': {
      units: { cup: 280, serving: 280, plate: 560, tbsp: 24, spoon: 31 }
    },
    'Tikka Sauce': {
      units: { cup: 200, serving: 200, tbsp: 17, spoon: 22 }
    },
    'Tandoori Sauce': {
      units: { cup: 150, serving: 150, tbsp: 13, spoon: 17 }
    },

    // Breads
    'Chapati': {
      units: { piece: 70, serving: 140, tbsp: 7, gram: 0.7 }
    },
    'Roti': {
      units: { piece: 70, serving: 140, tbsp: 7, gram: 0.7 }
    },
    'Naan Bread': {
      units: { piece: 300, serving: 300, tbsp: 30, gram: 3.0 }
    },
    'Butter Naan': {
      units: { piece: 330, serving: 330, tbsp: 33, gram: 3.3 }
    },
    'Garlic Naan': {
      units: { piece: 320, serving: 320, tbsp: 32, gram: 3.2 }
    },
    'Paratha': {
      units: { piece: 240, serving: 240, tbsp: 20, gram: 2.4 }
    },
    'Aloo Paratha': {
      units: { piece: 280, serving: 280, tbsp: 24, gram: 2.8 }
    },
    'Methi Paratha': {
      units: { piece: 260, serving: 260, tbsp: 22, gram: 2.6 }
    },
    'Puri (Fried Bread)': {
      units: { piece: 150, serving: 300, tbsp: 13, gram: 1.5 }
    },
    'Bhature': {
      units: { piece: 400, serving: 400, tbsp: 35, gram: 4.0 }
    },
    'Luchi': {
      units: { piece: 120, serving: 240, tbsp: 10, gram: 1.2 }
    },

    // South Indian
    'Dosa': {
      units: { piece: 210, serving: 210, tbsp: 18, gram: 2.1 }
    },
    'Masala Dosa': {
      units: { piece: 250, serving: 250, tbsp: 21, gram: 2.5 }
    },
    'Paper Dosa': {
      units: { piece: 180, serving: 180, tbsp: 15, gram: 1.8 }
    },
    'Idli': {
      units: { piece: 60, serving: 180, tbsp: 5, gram: 0.6 }
    },
    'Sambar (South Indian)': {
      units: { cup: 120, serving: 120, bowl: 180, tbsp: 10 }
    },
    'Rasam': {
      units: { cup: 100, serving: 100, bowl: 150, tbsp: 8 }
    },
    'Uttapam': {
      units: { piece: 180, serving: 180, tbsp: 15, gram: 1.8 }
    },
    'Appam': {
      units: { piece: 140, serving: 280, tbsp: 12, gram: 1.4 }
    },
    'Puttu': {
      units: { piece: 120, serving: 240, tbsp: 10, gram: 1.2 }
    },

    // Spicy Dishes & Tandoori
    'Tandoori Chicken': {
      units: { '100g': 165, piece: 100, serving: 250, kg: 1650 }
    },
    'Tandoori Paneer': {
      units: { cup: 180, serving: 180, plate: 350, tbsp: 15 }
    },
    'Tandoori Fish': {
      units: { '100g': 140, piece: 150, serving: 280, kg: 1400 }
    },
    'Chicken Tikka': {
      units: { piece: 50, serving: 150, cup: 180, tbsp: 15 }
    },
    'Paneer Tikka': {
      units: { piece: 80, serving: 200, cup: 200, tbsp: 17 }
    },
    'Seekh Kebab': {
      units: { piece: 120, serving: 240, tbsp: 10 }
    },
    'Shami Kebab': {
      units: { piece: 100, serving: 200, tbsp: 8 }
    },

    // Street Food & Snacks
    'Samosa': {
      units: { piece: 200, serving: 400, tbsp: 17 }
    },
    'Aloo Samosa': {
      units: { piece: 180, serving: 360, tbsp: 15 }
    },
    'Veg Samosa': {
      units: { piece: 170, serving: 340, tbsp: 14 }
    },
    'Pakora': {
      units: { piece: 150, serving: 300, cup: 180, tbsp: 12 }
    },
    'Onion Bhajji': {
      units: { piece: 120, serving: 240, cup: 150, tbsp: 10 }
    },
    'Pani Puri': {
      units: { cup: 100, serving: 200, piece: 8, tbsp: 8 }
    },
    'Chaat (Pani Puri)': {
      units: { cup: 100, serving: 200, plate: 200, tbsp: 8 }
    },
    'Bhel Puri': {
      units: { cup: 150, serving: 150, plate: 200, tbsp: 13 }
    },
    'Sev Puri': {
      units: { cup: 140, serving: 140, plate: 200, tbsp: 12 }
    },
    'Dahi Puri': {
      units: { cup: 120, serving: 120, piece: 6, tbsp: 10 }
    },
    'Gol Gappa': {
      units: { cup: 80, serving: 160, piece: 10, tbsp: 7 }
    },
    'Vada': {
      units: { piece: 150, serving: 300, cup: 180, tbsp: 13 }
    },
    'Medu Vada': {
      units: { piece: 130, serving: 260, cup: 160, tbsp: 11 }
    },
    'Kachori': {
      units: { piece: 180, serving: 360, cup: 220, tbsp: 15 }
    },
    'Jhal Muri': {
      units: { cup: 120, serving: 240, tbsp: 10 }
    },
    'Chikhalwali': {
      units: { cup: 200, serving: 200, tbsp: 17 }
    },

    // Regional Specialties
    'Chole Bhature': {
      units: { piece: 350, serving: 350, plate: 700, tbsp: 30 }
    },
    'Pav Bhaji': {
      units: { serving: 300, plate: 300, cup: 250, tbsp: 25 }
    },
    'Upma': {
      units: { cup: 140, serving: 140, plate: 280, tbsp: 12 }
    },
    'Khichdi': {
      units: { cup: 180, serving: 180, plate: 360, tbsp: 15 }
    },
    'Pulav': {
      units: { cup: 200, serving: 200, plate: 400, tbsp: 17 }
    },
    'Poha': {
      units: { cup: 120, serving: 200, plate: 200, tbsp: 10 }
    },

    // Desserts
    'Gulab Jamun': {
      units: { piece: 300, serving: 600, cup: 400, tbsp: 25 }
    },
    'Kheer (Rice Pudding)': {
      units: { cup: 300, serving: 300, bowl: 300, tbsp: 25 }
    },
    'Jalebi': {
      units: { piece: 200, serving: 400, cup: 300, tbsp: 17 }
    },
    'Barfi': {
      units: { piece: 250, serving: 500, cup: 350, tbsp: 21 }
    },
    'Laddu': {
      units: { piece: 150, serving: 300, tbsp: 13 }
    },
    'Rasgulla': {
      units: { piece: 150, serving: 300, cup: 250, tbsp: 13 }
    },
    'Shahi Tukda': {
      units: { piece: 280, serving: 560, cup: 350, tbsp: 24 }
    },
    'Halwa': {
      units: { cup: 280, serving: 280, plate: 420, tbsp: 24 }
    },

    // Beverages
    'Lassi (Sweet)': {
      units: { cup: 200, glass: 230, ml: 50, tbsp: 13 }
    },
    'Salt Lassi': {
      units: { cup: 180, glass: 210, ml: 45, tbsp: 12 }
    },
    'Mango Lassi': {
      units: { cup: 220, glass: 250, ml: 55, tbsp: 15 }
    },
    'Chaach (Buttermilk)': {
      units: { cup: 150, glass: 180, ml: 40, tbsp: 10 }
    },
    'Masala Chai': {
      units: { cup: 80, glass: 100, ml: 20, tbsp: 5 }
    },
    'Indian Coffee': {
      units: { cup: 100, glass: 120, ml: 25, tbsp: 8 }
    },
  },

  // Indian Ingredients & Staples
  indianIngredients: {
    // Lentils & Legumes
    'Red Lentils (Masoor)': {
      units: { cup: 230, '100g': 352, gram: 3.52, tbsp: 19 }
    },
    'Yellow Lentils (Moong)': {
      units: { cup: 240, '100g': 347, gram: 3.47, tbsp: 20 }
    },
    'Black Lentils (Urad)': {
      units: { cup: 250, '100g': 365, gram: 3.65, tbsp: 21 }
    },
    'Chickpeas (Bengal Gram)': {
      units: { cup: 269, '100g': 364, gram: 3.64, tbsp: 22 }
    },
    'Black Chickpeas (Kala Chana)': {
      units: { cup: 280, '100g': 380, gram: 3.80, tbsp: 23 }
    },
    'Peas (Matar)': {
      units: { cup: 118, '100g': 81, gram: 0.81, tbsp: 10 }
    },

    // Rice Varieties
    'Basmati Rice': {
      units: { cup: 206, '100g': 130, gram: 1.30, tbsp: 17 }
    },
    'Jasmine Rice': {
      units: { cup: 205, '100g': 129, gram: 1.29, tbsp: 17 }
    },
    'Long Grain Rice': {
      units: { cup: 210, '100g': 130, gram: 1.30, tbsp: 17 }
    },

    // Spices (measured by tbsp)
    'Cumin Seeds': {
      units: { tbsp: 8, gram: 0.8, tsp: 2.5, '100g': 375 }
    },
    'Coriander Seeds': {
      units: { tbsp: 6, gram: 0.6, tsp: 2.0, '100g': 298 }
    },
    'Mustard Seeds': {
      units: { tbsp: 10, gram: 1.0, tsp: 3.3, '100g': 508 }
    },
    'Fenugreek Seeds (Methi)': {
      units: { tbsp: 12, gram: 1.2, tsp: 4.0, '100g': 323 }
    },
    'Black Cumin': {
      units: { tsp: 3, tbsp: 9, gram: 0.75, '100g': 375 }
    },
    'Red Chili Powder': {
      units: { tsp: 6, tbsp: 18, gram: 1.5, '100g': 318 }
    },
    'Turmeric Powder': {
      units: { tsp: 5.5, tbsp: 16.5, gram: 1.5, '100g': 312 }
    },
    'Garam Masala': {
      units: { tsp: 4, tbsp: 12, gram: 1.0, '100g': 300 }
    },
    'Black Pepper': {
      units: { tsp: 5.75, tbsp: 17, gram: 1.5, '100g': 251 }
    },
    'Cardamom': {
      units: { pod: 2, tbsp: 8, gram: 0.5, '100g': 311 }
    },
    'Cinnamon': {
      units: { stick: 10, tsp: 5, gram: 0.5, '100g': 247 }
    },
    'Cloves': {
      units: { pod: 4, tsp: 4.5, gram: 0.5, '100g': 323 }
    },
    'Bay Leaves': {
      units: { leaf: 1, gram: 0.2, '100g': 313 }
    },

    // Herbs
    'Fresh Cilantro (Coriander Leaves)': {
      units: { cup: 4, gram: 0.04, tbsp: 1 }
    },
    'Fresh Mint': {
      units: { cup: 12, gram: 0.08, tbsp: 1 }
    },
    'Kasuri Methi (Dried Fenugreek)': {
      units: { tbsp: 0.5, gram: 0.1, tsp: 1 }
    },

    // Pastes & Bases
    'Ginger Paste': {
      units: { tbsp: 14, gram: 1.4, tsp: 4.5, '100g': 49 }
    },
    'Garlic Paste': {
      units: { tbsp: 15, gram: 1.5, tsp: 5.0, '100g': 149 }
    },
    'Ginger-Garlic Paste': {
      units: { tbsp: 14, gram: 1.4, tsp: 4.5 }
    },
    'Green Chili Paste': {
      units: { tbsp: 16, gram: 1.6, tsp: 5.3, '100g': 40 }
    },
    'Chaat Masala': {
      units: { tsp: 3.5, tbsp: 10, gram: 1.0, '100g': 294 }
    },

    // Oils & Fats
    'Mustard Oil': {
      units: { tbsp: 135, ml: 20, liter: 2700, gram: 1.35 }
    },
    'Ghee (Clarified Butter)': {
      units: { tbsp: 135, ml: 20, gram: 1.35, cup: 1080 }
    },
    'Coconut Oil': {
      units: { tbsp: 120, ml: 20, gram: 1.20, cup: 960 }
    },

    // Yogurt & Dairy
    'Hung Yogurt (Chakli Grade)': {
      units: { cup: 240, tbsp: 15, gram: 2.4 }
    },
    'Cream (Malai)': {
      units: { tbsp: 50, ml: 15, gram: 0.5, cup: 400 }
    },
    'Full Fat Milk': {
      units: { cup: 150, ml: 30, glass: 200, tbsp: 10 }
    },

    // Fritters & Binding Agents
    'Gram Flour (Besan)': {
      units: { cup: 120, '100g': 387, gram: 3.87, tbsp: 8 }
    },
    'Rice Flour': {
      units: { cup: 158, '100g': 366, gram: 3.66, tbsp: 10 }
    },
    'Tamarind Paste': {
      units: { tbsp: 12, gram: 1.2, tsp: 4.0 }
    },

    // Nuts
    'Cashews': {
      units: { piece: 8, '100g': 553, gram: 5.53, cup: 135, tbsp: 12 }
    },
    'Almonds': {
      units: { piece: 11, '100g': 579, gram: 5.79, cup: 95, tbsp: 12 }
    },
    'Pine Nuts': {
      units: { '100g': 673, gram: 6.73, tbsp: 15 }
    },
    'Coconut (Grated)': {
      units: { cup: 93, '100g': 354, gram: 3.54, tbsp: 6 }
    },
  },
  // Fast Food
  fastFood: {
    Pizza: {
      units: { slice: 280, piece: 280, serving: 840, gram: 2.8 }
    },
    Burger: {
      units: { piece: 540, '100g': 280, gram: 5.4, serving: 540 }
    },
    'French Fries': {
      units: { serving: 365, cup: 300, gram: 3.65, oz: 103 }
    },
    'Cheeseburger': {
      units: { piece: 580, serving: 580, gram: 4.8 }
    },
    'Fried Chicken': {
      units: { piece: 320, '100g': 320, gram: 3.20, serving: 640, oz: 90 }
    },
  },
  // Beverages
  beverages: {
    'Orange Juice': {
      units: { cup: 110, ml: 22, liter: 220, glass: 150, tbsp: 7 }
    },
    'Apple Juice': {
      units: { cup: 114, ml: 23, liter: 230, glass: 160, tbsp: 8 }
    },
    Coffee: {
      units: { cup: 0, ml: 0, tbsp: 0 }
    },
    Tea: {
      units: { cup: 0, ml: 0, tbsp: 0 }
    },
    Soda: {
      units: { cup: 140, ml: 28, liter: 280, glass: 200, can: 140 }
    },
    Smoothie: {
      units: { cup: 250, ml: 50, liter: 500, glass: 300, tbsp: 15 }
    },
  },
};

// Get all food names with their categories
export const getAllFoodNames = () => {
  const names: string[] = [];
  Object.entries(FOOD_DATABASE).forEach(([_, foods]) => {
    names.push(...Object.keys(foods));
  });
  return names;
};

// Get available units for a food
export const getUnitsForFood = (foodName: string) => {
  for (const foods of Object.values(FOOD_DATABASE)) {
    if (foodName in foods) {
      const food = foods[foodName] as { units: { [key: string]: number } };
      return Object.keys(food.units);
    }
  }
  return [];
};

// Calculate calories based on food, quantity and unit
export const calculateCalories = (foodName: string, quantity: number, unit: string): number | null => {
  for (const foods of Object.values(FOOD_DATABASE)) {
    if (foodName in foods) {
      const food = foods[foodName] as { units: { [key: string]: number } };
      if (unit in food.units) {
        const caloriesPer = food.units[unit];
        return Math.round(caloriesPer * quantity);
      }
    }
  }
  return null;
};

// Get calorie estimate based on food name and amount
export const estimateCalories = (foodName: string, amount: number | string): number | null => {
  const allNames = getAllFoodNames();
  if (!allNames.includes(foodName)) return null;
  
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  const units = getUnitsForFood(foodName);
  if (units.length === 0) return null;
  
  // Use the first available unit as default
  return calculateCalories(foodName, amountNum, units[0]);
};
