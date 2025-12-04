/**
 * TypeScript interfaces for Smart Search School Panel State
 * Phase 2.10.7.2 - Redux State Management
 * =====================================================
 *
 * These interfaces define the structure of school panel state
 * used by Redux store for school search, filtering, and selection.
 *
 * Key Features:
 * - School filter state (name, type, gender, etc.)
 * - Search results management
 * - Max 3 selected schools constraint
 * - Map marker visibility toggle
 * - Loading and error states
 */

/**
 * School data from API
 */
export interface School {
  /** Unique school identifier */
  school_id: string;

  /** School name */
  school_name: string;

  /** School type (Primary, Secondary, etc.) */
  school_type?: string;

  /** Education level (Infants, Primary, Secondary) */
  education_level?: string;

  /** Whether school is selective */
  selective_school?: string;

  /** School gender (Coed, Boys, Girls) */
  gender?: string;

  /** School denomination (Catholic, Anglican, etc.) */
  denomination?: string;

  /** Full street address */
  address?: string;

  /** Suburb name */
  suburb?: string;

  /** Postcode */
  postcode?: string;

  /** State ranking */
  state_rank?: string;

  /** HSC average ATAR (NSW only) */
  hsc_avg_atar_nsw?: string;

  /** School latitude coordinate */
  latitude?: number;

  /** School longitude coordinate */
  longitude?: number;

  /** Catchment area ID (e.g., "NSW-CATCH-1280") - Phase 2.13 fix: changed from boolean to string */
  catchment_area?: string | null;

  /** Catchment boundary polygon coordinates [[[[lng, lat], ...]]] */
  catchment_boundary?: number[][][][] | null;

  /** Boolean flag indicating if school has an official catchment boundary polygon */
  has_catchment_boundary?: boolean;
}

/**
 * School filter state
 */
export interface SchoolFilters {
  /** School name search query */
  schoolName: string;

  /** Selective school filter (Yes/No/None) */
  selectiveSchool?: string;

  /** Education levels (multi-select) */
  educationLevels: string[];

  /** School types (multi-select) */
  schoolTypes: string[];

  /** School genders (multi-select) */
  genders: string[];

  /** School denominations (multi-select) */
  denominations: string[];

  /** Opportunity class availability */
  opportunityClass?: boolean;

  /** Boarding school (Yes/No/Partial) */
  boardingSchool?: string;

  /** Special needs support */
  specialNeeds?: boolean;
}

/**
 * School panel tab type
 * Phase 2.47: Added for tab-based panel structure
 */
export type SchoolPanelTab = 'search' | 'selected';

/**
 * Complete school panel state
 */
export interface SchoolPanelState {
  /** Filter state */
  filters: SchoolFilters;

  /** Search results from API */
  searchResults: School[];

  /** Selected schools (max 3) */
  selectedSchools: School[];

  /** Whether to show markers on map */
  showMarkersOnMap: boolean;

  /** Schools visible within current map bounds */
  visibleSchoolMarkers: School[];

  /** API loading state */
  loading: boolean;

  /** Error message if any */
  error: string | null;

  /** Active panel tab - Phase 2.47 */
  activeTab: SchoolPanelTab;
}

/**
 * Default filter values
 */
export const DEFAULT_SCHOOL_FILTERS: SchoolFilters = {
  schoolName: '',
  educationLevels: [],
  schoolTypes: [],
  genders: [],
  denominations: [],
};

/**
 * Default school panel state
 */
export const DEFAULT_SCHOOL_PANEL_STATE: SchoolPanelState = {
  filters: DEFAULT_SCHOOL_FILTERS,
  searchResults: [],
  selectedSchools: [],
  showMarkersOnMap: false,
  visibleSchoolMarkers: [],
  loading: false,
  error: null,
  activeTab: 'search',
};

/**
 * Maximum number of schools that can be selected
 * Phase 2.16: Changed from 3 to 1 for single school selection
 */
export const MAX_SELECTED_SCHOOLS = 1;

/**
 * Education level options
 * NOTE: These MUST match database values exactly (case-sensitive)
 */
export const EDUCATION_LEVELS = [
  'Infants School',
  'Primary School',
  'Secondary School',
  'Primary School, Secondary School',
];

/**
 * School type options
 * NOTE: These MUST match database values exactly (case-sensitive)
 * Database contains: Comprehensive, Independent School, Agricultural, Creative Arts,
 * Distance Education, Intensive English, Junior College, Language, Marine Technology,
 * Other, Performing Arts, Rural Technology, Senior College, Sports, Technology, Visual Arts
 */
export const SCHOOL_TYPES = [
  'Comprehensive',
  'Independent School',
  'Agricultural',
  'Creative Arts',
  'Distance Education',
  'Intensive English',
  'Language',
  'Performing Arts',
  'Sports',
  'Technology',
  'Visual Arts',
];

/**
 * Gender options
 * NOTE: Database uses lowercase values (coed, boys, girls)
 */
export const GENDER_OPTIONS = [
  'coed',
  'boys',
  'girls',
];

/**
 * Selective school options
 * NOTE: Database uses these exact values (case-sensitive)
 */
export const SELECTIVE_OPTIONS = [
  'Fully Selective',
  'Partially Selective',
  'Not Selective',
];

/**
 * Boarding school options
 * NOTE: Database stores as string "true" or "false"
 */
export const BOARDING_OPTIONS = [
  'true',
  'false',
];
