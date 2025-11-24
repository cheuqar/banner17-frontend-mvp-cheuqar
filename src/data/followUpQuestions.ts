// Predefined follow-up questions for Australian property buyers
// Categorized by buyer interests and system capabilities

export interface FollowUpQuestion {
  id: string;
  question: string;
  category: string;
  tags: string[];
  description: string;
  systemCapability: string; // What backend capability this uses
}

export const FOLLOW_UP_QUESTIONS: FollowUpQuestion[] = [
  // === AMENITIES & LIFESTYLE (Spatial Search Capabilities) ===
  {
    id: "amenities_001",
    question: "What libraries are within walking distance?",
    category: "Amenities & Lifestyle",
    tags: ["education", "family", "walking"],
    description: "Find nearby public libraries for reading and study",
    systemCapability: "propdb_amenities"
  },
  {
    id: "amenities_002", 
    question: "Show me hospitals within 5km radius",
    category: "Amenities & Lifestyle",
    tags: ["healthcare", "emergency", "safety"],
    description: "Locate nearby medical facilities and hospitals",
    systemCapability: "propdb_amenities"
  },
  {
    id: "amenities_003",
    question: "Are there shopping centers nearby?",
    category: "Amenities & Lifestyle", 
    tags: ["shopping", "convenience", "retail"],
    description: "Find shopping malls and retail centers",
    systemCapability: "propdb_amenities"
  },
  {
    id: "amenities_004",
    question: "What universities or TAFE are within 10km?",
    category: "Amenities & Lifestyle",
    tags: ["education", "students", "investment"],
    description: "Locate higher education institutions nearby",
    systemCapability: "propdb_amenities"
  },
  {
    id: "amenities_005",
    question: "Show libraries and hospitals within 2km",
    category: "Amenities & Lifestyle",
    tags: ["healthcare", "education", "convenience"],
    description: "Find essential services in close proximity",
    systemCapability: "propdb_amenities"
  },
  {
    id: "amenities_006",
    question: "What shopping options are within walking distance?",
    category: "Amenities & Lifestyle",
    tags: ["shopping", "walkability", "daily-needs"],
    description: "Discover nearby retail and shopping facilities",
    systemCapability: "propdb_amenities"
  },
  {
    id: "amenities_007",
    question: "Are there any universities within 15km for students?",
    category: "Amenities & Lifestyle", 
    tags: ["education", "students", "rental-potential"],
    description: "Check proximity to higher education for investment potential",
    systemCapability: "propdb_amenities"
  },
  {
    id: "amenities_008",
    question: "Show me the nearest hospital and its distance",
    category: "Amenities & Lifestyle",
    tags: ["healthcare", "emergency", "convenience"],
    description: "Find closest medical facility for emergency access",
    systemCapability: "propdb_amenities"
  },
  {
    id: "amenities_009",
    question: "What libraries are available within 3km?",
    category: "Amenities & Lifestyle",
    tags: ["education", "community", "family"],
    description: "Locate public libraries for community access",
    systemCapability: "propdb_amenities"
  },
  {
    id: "amenities_010",
    question: "Are there major shopping centers within 5km?",
    category: "Amenities & Lifestyle",
    tags: ["shopping", "entertainment", "lifestyle"],
    description: "Find large retail destinations nearby",
    systemCapability: "propdb_amenities"
  },

  // === COMPARABLE PROPERTIES (Property Search Capabilities) ===
  {
    id: "comparable_001",
    question: "Show me similar properties in the same suburb",
    category: "Comparable Properties",
    tags: ["market-analysis", "pricing", "local"],
    description: "Find comparable properties in the immediate area",
    systemCapability: "search_public_properties"
  },
  {
    id: "comparable_002", 
    question: "What are similar properties selling for nearby?",
    category: "Comparable Properties",
    tags: ["pricing", "market-value", "comparison"],
    description: "Compare prices of similar properties",
    systemCapability: "search_public_properties"
  },
  {
    id: "comparable_003",
    question: "Find houses with the same number of bedrooms in this area",
    category: "Comparable Properties", 
    tags: ["bedrooms", "family-size", "comparison"],
    description: "Compare properties with matching bedroom count",
    systemCapability: "search_public_properties"
  },
  {
    id: "comparable_004",
    question: "Show me properties with similar price range in NSW",
    category: "Comparable Properties",
    tags: ["pricing", "budget", "state-wide"],
    description: "Find properties within similar price bracket",
    systemCapability: "search_public_properties"
  },
  {
    id: "comparable_005",
    question: "Are there cheaper alternatives in nearby suburbs?", 
    category: "Comparable Properties",
    tags: ["budget", "alternatives", "suburbs"],
    description: "Explore more affordable options in surrounding areas",
    systemCapability: "search_public_properties"
  },
  {
    id: "comparable_006",
    question: "What's the most expensive property in this suburb?",
    category: "Comparable Properties",
    tags: ["luxury", "market-top", "suburb"],
    description: "Find premium properties in the local market",
    systemCapability: "search_public_properties"
  },
  {
    id: "comparable_007",
    question: "Show me recently sold properties in this area",
    category: "Comparable Properties",
    tags: ["sold", "market-trends", "recent"],
    description: "Check recent sales data for market insights",
    systemCapability: "search_public_properties"
  },
  {
    id: "comparable_008",
    question: "Find properties with more bedrooms in the same price range",
    category: "Comparable Properties",
    tags: ["bedrooms", "value", "space"],
    description: "Discover better value properties with more space",
    systemCapability: "search_public_properties"
  },
  {
    id: "comparable_009",
    question: "What townhouses are available in this suburb?",
    category: "Comparable Properties",
    tags: ["townhouse", "property-type", "suburb"],
    description: "Explore townhouse options in the same area",
    systemCapability: "search_public_properties"
  },
  {
    id: "comparable_010",
    question: "Show me apartments under the same budget nearby",
    category: "Comparable Properties",
    tags: ["apartments", "budget", "alternative"],
    description: "Find apartment alternatives within budget",
    systemCapability: "search_public_properties"
  },

  // === INVESTMENT ANALYSIS (Market Research) ===
  {
    id: "investment_001",
    question: "How many properties are for sale in this suburb?",
    category: "Investment Analysis",
    tags: ["market-supply", "investment", "suburb"],
    description: "Analyze market supply in the local area",
    systemCapability: "search_public_properties"
  },
  {
    id: "investment_002",
    question: "What's the average price for houses in this suburb?",
    category: "Investment Analysis",
    tags: ["average-price", "market-analysis", "houses"],
    description: "Calculate market averages for the area",
    systemCapability: "search_public_properties"
  },
  {
    id: "investment_003",
    question: "Are there any universities nearby for rental potential?",
    category: "Investment Analysis",
    tags: ["rental", "students", "investment"],
    description: "Assess rental potential near educational institutions",
    systemCapability: "propdb_amenities"
  },
  {
    id: "investment_004",
    question: "Show me the cheapest properties in this suburb",
    category: "Investment Analysis",
    tags: ["budget", "entry-level", "affordable"],
    description: "Find entry-level investment opportunities",
    systemCapability: "search_public_properties"
  },
  {
    id: "investment_005",
    question: "What's the price range for properties in this area?",
    category: "Investment Analysis",
    tags: ["price-range", "market-spectrum", "analysis"],
    description: "Understand the full price spectrum in the area",
    systemCapability: "search_public_properties"
  },
  {
    id: "investment_006", 
    question: "How many hospitals are within 5km for healthcare access?",
    category: "Investment Analysis",
    tags: ["healthcare", "accessibility", "investment"],
    description: "Evaluate healthcare accessibility for residents",
    systemCapability: "propdb_amenities"
  },
  {
    id: "investment_007",
    question: "Are there shopping centers that attract foot traffic?",
    category: "Investment Analysis", 
    tags: ["commercial", "foot-traffic", "retail"],
    description: "Assess commercial activity and foot traffic",
    systemCapability: "propdb_amenities"
  },
  {
    id: "investment_008",
    question: "What's the supply of apartments vs houses in this suburb?",
    category: "Investment Analysis",
    tags: ["supply", "property-mix", "market"],
    description: "Analyze property type distribution in the area",
    systemCapability: "search_public_properties"
  },
  {
    id: "investment_009",
    question: "Find properties with the best value per bedroom",
    category: "Investment Analysis",
    tags: ["value", "bedrooms", "efficiency"],
    description: "Calculate value efficiency by bedroom count",
    systemCapability: "search_public_properties"
  },
  {
    id: "investment_010",
    question: "What educational facilities are nearby for families?",
    category: "Investment Analysis",
    tags: ["education", "families", "schools"],
    description: "Assess family appeal through educational access",
    systemCapability: "propdb_amenities"
  },

  // === LOCATION INSIGHTS (Spatial & Geographic) ===
  {
    id: "location_001",
    question: "Plot this property on a map with nearby amenities",
    category: "Location Insights",
    tags: ["map", "visualization", "amenities"],
    description: "Visualize property location with surrounding facilities",
    systemCapability: "plot_properties"
  },
  {
    id: "location_002",
    question: "What's in walking distance from this property?",
    category: "Location Insights", 
    tags: ["walkability", "convenience", "daily-life"],
    description: "Discover facilities within walking distance",
    systemCapability: "propdb_amenities"
  },
  {
    id: "location_003",
    question: "Show me all amenities within 1km radius",
    category: "Location Insights",
    tags: ["amenities", "proximity", "convenience"],
    description: "Get comprehensive amenity overview nearby",
    systemCapability: "propdb_amenities"
  },
  {
    id: "location_004", 
    question: "Where are the nearest essential services?",
    category: "Location Insights",
    tags: ["essential-services", "healthcare", "education"],
    description: "Locate critical services like hospitals and schools",
    systemCapability: "propdb_amenities"
  },
  {
    id: "location_005",
    question: "What suburbs have similar properties nearby?",
    category: "Location Insights",
    tags: ["suburbs", "regional", "alternatives"],
    description: "Explore similar properties in neighboring areas",
    systemCapability: "search_public_properties"
  },
  {
    id: "location_006",
    question: "Map out similar properties in this region",
    category: "Location Insights",
    tags: ["map", "regional", "comparison"],
    description: "Visualize comparable properties geographically",
    systemCapability: "plot_properties"
  },
  {
    id: "location_007",
    question: "What's the closest major shopping destination?",
    category: "Location Insights",
    tags: ["shopping", "major", "distance"],
    description: "Find primary shopping destinations nearby", 
    systemCapability: "propdb_amenities"
  },
  {
    id: "location_008",
    question: "How far is the nearest hospital from here?",
    category: "Location Insights",
    tags: ["healthcare", "distance", "accessibility"],
    description: "Calculate distance to nearest medical facility",
    systemCapability: "propdb_amenities"
  },
  {
    id: "location_009",
    question: "Show me properties along the same street or nearby",
    category: "Location Insights",
    tags: ["street", "neighborhood", "local"],
    description: "Find properties in the immediate neighborhood",
    systemCapability: "search_public_properties"
  },
  {
    id: "location_010",
    question: "What facilities are within a 10-minute drive?",
    category: "Location Insights",
    tags: ["driving", "accessibility", "facilities"],
    description: "Assess facilities within short driving distance",
    systemCapability: "propdb_amenities"
  },

  // === FAMILY & LIFESTYLE (Specific Buyer Needs) ===
  {
    id: "family_001",
    question: "Are there family-friendly facilities nearby?",
    category: "Family & Lifestyle",
    tags: ["family", "children", "lifestyle"],
    description: "Find amenities suitable for families with children",
    systemCapability: "propdb_amenities"
  },
  {
    id: "family_002",
    question: "What schools and libraries are in the area?",
    category: "Family & Lifestyle",
    tags: ["schools", "libraries", "education"],
    description: "Locate educational facilities for family needs",
    systemCapability: "propdb_amenities"
  },
  {
    id: "family_003",
    question: "Show me larger family homes in this suburb",
    category: "Family & Lifestyle",
    tags: ["family-homes", "large", "bedrooms"],
    description: "Find spacious properties suitable for families",
    systemCapability: "search_public_properties"
  },
  {
    id: "family_004",
    question: "Are there properties with more bathrooms nearby?",
    category: "Family & Lifestyle",
    tags: ["bathrooms", "convenience", "family"],
    description: "Find properties with additional bathroom facilities",
    systemCapability: "search_public_properties"
  },
  {
    id: "family_005",
    question: "What's available for families on a similar budget?",
    category: "Family & Lifestyle", 
    tags: ["family", "budget", "suitable"],
    description: "Discover family-suitable properties within budget",
    systemCapability: "search_public_properties"
  },
  
  // === FOREIGN BUYER CONSIDERATIONS ===
  {
    id: "foreign_001",
    question: "What apartments are available for foreign buyers?",
    category: "Foreign Buyer",
    tags: ["foreign-buyer", "apartments", "eligible"],
    description: "Find apartments suitable for foreign investment",
    systemCapability: "search_public_properties"
  },
  {
    id: "foreign_002", 
    question: "Show me off-the-plan properties in this area",
    category: "Foreign Buyer",
    tags: ["off-the-plan", "new", "investment"],
    description: "Find new development opportunities",
    systemCapability: "search_public_properties"
  },
  {
    id: "foreign_003",
    question: "What's the rental potential near universities?",
    category: "Foreign Buyer",
    tags: ["rental", "universities", "investment"],
    description: "Assess student accommodation investment potential",
    systemCapability: "propdb_amenities"
  },
  {
    id: "foreign_004",
    question: "Are there high-rise apartments in this suburb?",
    category: "Foreign Buyer", 
    tags: ["high-rise", "apartments", "modern"],
    description: "Find modern apartment developments",
    systemCapability: "search_public_properties"
  },
  {
    id: "foreign_005",
    question: "What new developments are available nearby?",
    category: "Foreign Buyer",
    tags: ["new", "developments", "modern"],
    description: "Discover newly built or upcoming properties",
    systemCapability: "search_public_properties"
  }
];

// Helper functions for filtering questions
export const getQuestionsByCategory = (category: string): FollowUpQuestion[] => {
  return FOLLOW_UP_QUESTIONS.filter(q => q.category === category);
};

export const getQuestionsByTags = (tags: string[]): FollowUpQuestion[] => {
  return FOLLOW_UP_QUESTIONS.filter(q => 
    q.tags.some(tag => tags.includes(tag))
  );
};

export const getQuestionsByCapability = (capability: string): FollowUpQuestion[] => {
  return FOLLOW_UP_QUESTIONS.filter(q => q.systemCapability === capability);
};

export const QUESTION_CATEGORIES = [
  "Amenities & Lifestyle",
  "Comparable Properties", 
  "Investment Analysis",
  "Location Insights",
  "Family & Lifestyle",
  "Foreign Buyer"
] as const;

export type QuestionCategory = typeof QUESTION_CATEGORIES[number];
