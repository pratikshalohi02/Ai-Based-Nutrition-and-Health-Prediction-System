import { useState, useEffect } from 'react';
import { Heart, Utensils, Coffee, Apple, AlertCircle } from 'lucide-react';

interface DietRecommendation {
  category: string;
  description: string;
  meal_plan: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  foods_to_eat: string[];
  foods_to_avoid: string[];
  tips: string[];
}

const DEFAULT_RECOMMENDATIONS: DietRecommendation = {
  category: 'Balanced Nutrition',
  description: 'A well-rounded diet for optimal health and fitness',
  meal_plan: {
    breakfast: ['Oatmeal with berries and almonds', 'Greek yogurt with granola', 'Whole grain toast with avocado'],
    lunch: ['Grilled chicken with quinoa and vegetables', 'Salmon with sweet potato', 'Lentil soup with whole wheat bread'],
    dinner: ['Lean beef with brown rice and broccoli', 'Turkey meatballs with whole wheat pasta', 'Baked fish with roasted vegetables'],
    snacks: ['Apple with almond butter', 'Mixed nuts', 'String cheese', 'Carrot sticks with hummus'],
  },
  foods_to_eat: [
    'Lean proteins (chicken, fish, turkey)',
    'Whole grains (oats, brown rice, quinoa)',
    'Fresh vegetables (broccoli, spinach, carrots)',
    'Fruits (berries, apples, bananas)',
    'Healthy fats (avocado, olive oil, nuts)',
    'Legumes (beans, lentils, chickpeas)',
  ],
  foods_to_avoid: [
    'Processed foods and fast food',
    'Sugary beverages and desserts',
    'Deep-fried foods',
    'Refined grains and white bread',
    'Trans fats and saturated fats',
    'Excessive salt foods',
  ],
  tips: [
    'Drink plenty of water throughout the day',
    'Eat smaller, frequent meals',
    'Include protein in every meal',
    'Plan meals ahead of time',
    'Track your daily calorie intake',
    'Exercise regularly 30 minutes daily',
  ],
};

export default function Recommendations() {
  const [recommendations] = useState<DietRecommendation>(DEFAULT_RECOMMENDATIONS);
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Personalized Recommendations
        </h1>
        <p className="text-gray-600">
          AI-powered nutrition advice based on your health profile
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{recommendations.category}</h2>
            <p className="text-green-100">{recommendations.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Apple className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Foods to Eat</h3>
          </div>
          <ul className="space-y-2">
            {recommendations.foods_to_eat.map((food, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-gray-700">{food}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Foods to Avoid</h3>
          </div>
          <ul className="space-y-2">
            {recommendations.foods_to_avoid.map((food, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                <span className="text-gray-700">{food}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Utensils className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Sample Meal Plan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Coffee className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-gray-800">Breakfast</h4>
              </div>
              <ul className="space-y-2">
                {recommendations.meal_plan.breakfast.map((meal, index) => (
                  <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-orange-300">
                    {meal}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-800">Lunch</h4>
              </div>
              <ul className="space-y-2">
                {recommendations.meal_plan.lunch.map((meal, index) => (
                  <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-green-300">
                    {meal}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-800">Dinner</h4>
              </div>
              <ul className="space-y-2">
                {recommendations.meal_plan.dinner.map((meal, index) => (
                  <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-blue-300">
                    {meal}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Apple className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-800">Snacks</h4>
              </div>
              <ul className="space-y-2">
                {recommendations.meal_plan.snacks.map((snack, index) => (
                  <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-purple-300">
                    {snack}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Tips for Success
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.tips.map((tip, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg flex items-start gap-3"
            >
              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </span>
              <p className="text-gray-700 text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
