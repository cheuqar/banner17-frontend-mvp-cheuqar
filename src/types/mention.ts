// Mention system type definitions

export interface MentionCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface MentionEntity {
  id: string;
  type: string;
  category: string;
  name: string;
  display_text: string;
  entity_metadata: Record<string, any>;
}

export interface MentionEntityList {
  entities: MentionEntity[];
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface MentionEntityDetails {
  entity: MentionEntity;
  details: Record<string, any>;
}

export interface ChatSessionMention {
  id: string;
  session_id: string;
  entity_type: string;
  entity_id: string;
  entity_category: string;
  display_text: string;
  entity_metadata: Record<string, any>;
  created_at: string;
}

export interface MentionState {
  isActive: boolean;
  currentLevel: 'categories' | 'subcategories' | 'entities';
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  highlightedIndex: number;
  searchQuery: string;
  mentions: ChatSessionMention[];
  entities: MentionEntity[];
  hasMore: boolean;
  currentPage: number;
  isLoading: boolean;
}
