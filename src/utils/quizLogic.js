/**
 * Quiz Logic Utilities
 * Contains the mapping functions that convert quiz answers into coffee blend characteristics
 */

// Blend name suggestions based on characteristics
const BLEND_NAMES = [
  'Nocturne 03', 'Aurora Blend', 'Meridian', 'Solstice', 'Compass Rose',
  'Twilight', 'Zenith', 'Harmony', 'Cascade', 'Ember', 'Mosaic', 'Prism',
  'Velvet Storm', 'Golden Hour', 'Obsidian', 'Copper Peak', 'Silver Moon',
  'Starlight', 'Thunder Ridge', 'Crimson Dawn', 'Mystic Valley', 'Iron Mountain'
];

// Coffee origins with their characteristics
const ORIGINS = [
  { name: 'Ethiopian Yirgacheffe', profile: ['floral', 'citrus'], body: 'light' },
  { name: 'Colombian Huila', profile: ['chocolate', 'caramel'], body: 'medium' },
  { name: 'Guatemalan Antigua', profile: ['spicy', 'chocolate'], body: 'full' },
  { name: 'Brazilian Santos', profile: ['nutty', 'chocolate'], body: 'medium' },
  { name: 'Costa Rican Tarrazú', profile: ['citrus', 'berry'], body: 'medium' },
  { name: 'Jamaican Blue Mountain', profile: ['floral', 'nutty'], body: 'light' },
  { name: 'Hawaiian Kona', profile: ['nutty', 'caramel'], body: 'medium' },
  { name: 'Kenyan AA', profile: ['berry', 'citrus'], body: 'full' },
  { name: 'Peruvian Organic', profile: ['chocolate', 'nutty'], body: 'medium' },
  { name: 'Panamanian Geisha', profile: ['floral', 'berry'], body: 'light' }
];

// Flavor profiles mapping
const FLAVOR_PROFILES = {
  chocolate: {
    notes: ['Dark chocolate', 'Milk chocolate', 'Cocoa', 'Mocha'],
    intensity: 'rich',
    roastPreference: 'medium-dark'
  },
  caramel: {
    notes: ['Caramel sweetness', 'Butterscotch', 'Toffee', 'Brown sugar'],
    intensity: 'sweet',
    roastPreference: 'medium'
  },
  citrus: {
    notes: ['Bright citrus', 'Lemon zest', 'Orange', 'Grapefruit'],
    intensity: 'bright',
    roastPreference: 'light-medium'
  },
  berry: {
    notes: ['Berry notes', 'Blueberry', 'Blackcurrant', 'Cherry'],
    intensity: 'fruity',
    roastPreference: 'light'
  },
  nutty: {
    notes: ['Toasted hazelnut', 'Almond', 'Walnut', 'Pecan'],
    intensity: 'warm',
    roastPreference: 'medium'
  },
  floral: {
    notes: ['Floral hints', 'Jasmine', 'Lavender', 'Rose'],
    intensity: 'delicate',
    roastPreference: 'light'
  },
  spicy: {
    notes: ['Warm spice', 'Cinnamon', 'Clove', 'Cardamom'],
    intensity: 'complex',
    roastPreference: 'dark'
  }
};

/**
 * Main function to generate blend result from quiz answers
 * @param {Object} answers - Object containing answers keyed by question ID
 * @returns {Object} - Complete blend result object
 */
export function generateBlendResult(answers) {
  const drinkStyle = answers[1] || 'black';
  const roastPreference = answers[2] || 'medium';
  const flavors = Array.isArray(answers[3]) ? answers[3] : [answers[3] || 'chocolate'];
  const bitterness = answers[4] || 3;
  const brewMethod = answers[5] || 'drip';
  const caffeine = answers[6] || 'full';

  // Generate blend characteristics
  const name = generateBlendName(answers);
  const notes = generateTastingNotes(flavors, roastPreference, bitterness);
  const origins = generateOriginBlend(flavors, roastPreference);
  const roastLevel = mapRoastLevel(roastPreference);
  const grindSuggestion = mapGrindSuggestion(brewMethod);
  const caffeineLevel = mapCaffeineLevel(caffeine);
  const description = generateDescription(drinkStyle, roastPreference, flavors);

  return {
    name,
    notes,
    origins,
    roastLevel,
    grindSuggestion,
    caffeineLevel,
    description
  };
}

/**
 * Generate a blend name based on answers
 */
function generateBlendName(answers) {
  const seed = Object.values(answers)
    .filter(Boolean)
    .join('')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return BLEND_NAMES[seed % BLEND_NAMES.length];
}

/**
 * Generate tasting notes based on flavor preferences
 */
function generateTastingNotes(flavors, roastPreference, bitterness) {
  const selectedFlavors = flavors.filter(f => f && f !== 'skipped').slice(0, 3);

  if (selectedFlavors.length === 0) {
    selectedFlavors.push('chocolate'); // Default
  }

  const notes = selectedFlavors.map(flavor => {
    const profile = FLAVOR_PROFILES[flavor];
    if (!profile) return 'Complex notes';

    // Select note based on roast preference
    const noteIndex = roastPreference === 'light' ? 0 :
                     roastPreference === 'dark' ? profile.notes.length - 1 :
                     Math.floor(profile.notes.length / 2);

    return profile.notes[noteIndex] || profile.notes[0];
  });

  // Add finish note based on bitterness and roast
  const finishNotes = ['Smooth finish', 'Clean finish', 'Bold finish', 'Lingering finish'];
  const finishIndex = Math.min(Math.floor((bitterness - 1) / 1.25), finishNotes.length - 1);
  notes.push(finishNotes[finishIndex]);

  return notes.join(' • ');
}

/**
 * Generate origin blend based on flavor preferences
 */
function generateOriginBlend(flavors, roastPreference) {
  // Filter origins that match the flavor profile
  const matchingOrigins = ORIGINS.filter(origin =>
    flavors.some(flavor => origin.profile.includes(flavor))
  );

  // If no matches, use default origins
  const availableOrigins = matchingOrigins.length > 0 ? matchingOrigins : ORIGINS;

  // Select primary and secondary origins
  const primary = availableOrigins[0] || ORIGINS[0];
  const secondary = availableOrigins[1] || ORIGINS[1];

  // Determine blend percentages based on roast preference
  const primaryPercent = roastPreference === 'light' ? 70 :
                        roastPreference === 'dark' ? 55 : 60;
  const secondaryPercent = 100 - primaryPercent;

  return `${primary.name} ${primaryPercent}% • ${secondary.name} ${secondaryPercent}%`;
}

/**
 * Map roast preference to roast level description
 */
function mapRoastLevel(roastPreference) {
  const roastMap = {
    'light': 'Light Roast',
    'medium': 'Medium Roast',
    'dark': 'Dark Roast'
  };
  return roastMap[roastPreference] || 'Medium Roast';
}

/**
 * Map brew method to grind suggestion
 */
function mapGrindSuggestion(brewMethod) {
  const grindMap = {
    'espresso': 'Fine',
    'pour-over': 'Medium-fine',
    'drip': 'Medium',
    'french-press': 'Coarse',
    'pod': 'Pre-ground',
    'not-sure': 'Medium'
  };
  return grindMap[brewMethod] || 'Medium';
}

/**
 * Map caffeine preference to level description
 */
function mapCaffeineLevel(caffeine) {
  const caffeineMap = {
    'full': 'Full Caffeine',
    'half-caf': 'Half Caffeine',
    'low-decaf': 'Low/Decaf'
  };
  return caffeineMap[caffeine] || 'Full Caffeine';
}

/**
 * Generate personalized description
 */
function generateDescription(drinkStyle, roastPreference, flavors) {
  const styleDescriptions = {
    'black': 'pure coffee experience',
    'little-milk': 'lightly enhanced coffee',
    'milk-sugar': 'balanced sweetened coffee',
    'sweet-creamy': 'rich, indulgent coffee experience',
    'not-sure': 'versatile coffee experience'
  };

  const roastDescriptions = {
    'light': 'bright and nuanced',
    'medium': 'well-balanced',
    'dark': 'bold and robust'
  };

  const styleDesc = styleDescriptions[drinkStyle] || 'perfect coffee experience';
  const roastDesc = roastDescriptions[roastPreference] || 'expertly crafted';

  return `A carefully crafted blend that matches your taste preferences for ${styleDesc} with ${roastDesc} character. This blend celebrates the unique flavors you love while maintaining perfect balance in every cup.`;
}

/**
 * Analyze quiz completion time and provide insights
 */
export function analyzeQuizCompletion(timeElapsed, answers) {
  const seconds = Math.round(timeElapsed / 1000);
  const completedQuestions = Object.keys(answers).length;
  const averageTimePerQuestion = seconds / completedQuestions;

  return {
    totalTime: seconds,
    averageTime: Math.round(averageTimePerQuestion),
    efficiency: seconds <= 45 ? 'excellent' : seconds <= 60 ? 'good' : 'thorough',
    completionRate: (completedQuestions / 6) * 100
  };
}

/**
 * Generate recommendations for future orders
 */
export function generateRecommendations(answers) {
  const flavors = Array.isArray(answers[3]) ? answers[3] : [answers[3]];
  const brewMethod = answers[5];

  const recommendations = [];

  // Equipment recommendations based on brew method
  if (brewMethod === 'not-sure') {
    recommendations.push({
      type: 'equipment',
      title: 'Try a Pour-Over',
      description: 'Perfect for exploring different flavor profiles'
    });
  }

  // Flavor exploration suggestions
  if (flavors.includes('chocolate')) {
    recommendations.push({
      type: 'flavor',
      title: 'Explore Single Origins',
      description: 'Try our Brazilian Santos for rich chocolate notes'
    });
  }

  return recommendations;
}