import { useState, useCallback } from 'react';
import { buyerProfileService } from '../services/buyerProfileService';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  search_prompt: string;
  basic_criteria: any;
  location_criteria: any;
  advanced_criteria: any;
  buyer_context: any;
  tags: string[];
  usage_count: number;
  created_by: string;
  created_at: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface TemplatesResponse {
  sample_templates: Template[];
  user_profiles: Template[];
  filters: {
    category?: string;
    search?: string;
  };
}

export const useBuyerProfileTemplates = () => {
  const [templates, setTemplates] = useState<TemplatesResponse | null>(null);
  const [categories, setCategories] = useState<TemplateCategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await buyerProfileService.getTemplateCategories();

      if (response.success) {
        setCategories(response.data.categories);
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching template categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async (category?: string, search?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await buyerProfileService.getTemplates(category, search);

      if (response.success) {
        setTemplates(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch templates');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplateById = useCallback(async (templateId: string): Promise<Template | null> => {
    try {
      const response = await buyerProfileService.getTemplateById(templateId);

      if (response.success) {
        return response.data.template;
      } else {
        throw new Error(response.message || 'Failed to fetch template');
      }
    } catch (err) {
      console.error('Error fetching template by ID:', err);
      return null;
    }
  }, []);

  const startFromTemplate = useCallback(async (templateId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await buyerProfileService.startFromTemplate(templateId);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to start from template');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error starting from template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    templates,
    categories,
    loading,
    error,
    fetchCategories,
    fetchTemplates,
    getTemplateById,
    startFromTemplate,
  };
};