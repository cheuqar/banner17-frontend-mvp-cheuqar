/**
 * useBuyerProfiles Hook
 *
 * React hook for fetching and managing buyer profiles
 * Phase 3.6: Profile Management UI
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface BuyerProfile {
  id: string;
  user_id: string;
  profile_name: string;
  profile_description?: string;
  icon_emoji: string;
  color_code: string;
  search_prompt: string;
  basic_criteria: {
    property_types?: string[];
    bedrooms_min?: number;
    bedrooms_max?: number;
    budget_min?: number;
    budget_max?: number;
    location_criteria?: {
      state: string;
      suburbs?: string[];
      landmarks?: string[];
      postcodes?: string[];
    };
  };
  advanced_criteria?: Record<string, any>;
  property_features?: Record<string, any>;
  buyer_context?: Record<string, any>;
  unsupported_criteria?: Array<Record<string, any>>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

interface UseBuyerProfilesResult {
  profiles: BuyerProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteProfile: (profileId: string) => Promise<boolean>;
}

/**
 * Hook for fetching and managing buyer profiles
 */
export const useBuyerProfiles = (includeInactive: boolean = false): UseBuyerProfilesResult => {
  const [profiles, setProfiles] = useState<BuyerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch profiles from API
   */
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [useBuyerProfiles] Fetching profiles...');

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call API to get profiles
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100'}/api/v1/buyer-profile/profiles?include_inactive=${includeInactive}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data?.profiles) {
        setProfiles(data.data.profiles);
        console.log(`✅ [useBuyerProfiles] Fetched ${data.data.profiles.length} profiles`);
      } else {
        throw new Error(data.message || 'Failed to fetch profiles');
      }
    } catch (err) {
      console.error('❌ [useBuyerProfiles] Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  /**
   * Delete profile (soft delete)
   */
  const deleteProfile = useCallback(async (profileId: string): Promise<boolean> => {
    try {
      console.log(`🗑️ [useBuyerProfiles] Deleting profile: ${profileId}`);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100'}/api/v1/buyer-profile/profiles/${profileId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete profile: ${response.statusText}`);
      }

      console.log(`✅ [useBuyerProfiles] Profile deleted: ${profileId}`);

      // Remove from local state
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));

      return true;
    } catch (err) {
      console.error('❌ [useBuyerProfiles] Error deleting profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
      return false;
    }
  }, []);

  /**
   * Fetch profiles on mount and when includeInactive changes
   */
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
    deleteProfile,
  };
};
