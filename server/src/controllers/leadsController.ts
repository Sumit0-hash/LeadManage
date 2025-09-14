import { Response } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { Lead, PaginatedResponse, LeadFilters } from '../types';

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'> = {
      ...req.body,
      user_id: req.user.id,
      score: Math.max(0, Math.min(100, req.body.score || 0)),
      lead_value: req.body.lead_value || 0,
      is_qualified: req.body.is_qualified || false
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error('Create lead error:', error);
      if (error.code === '23505') { // Unique violation
        res.status(400).json({ error: 'Lead with this email already exists' });
        return;
      }
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    // Build filter query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    // Apply filters
    const filters = req.query as LeadFilters;

    if (filters.email) {
      if (filters.email.includes('*')) {
        query = query.like('email', filters.email.replace(/\*/g, '%'));
      } else {
        query = query.eq('email', filters.email);
      }
    }

    if (filters.company) {
      if (filters.company.includes('*')) {
        query = query.like('company', filters.company.replace(/\*/g, '%'));
      } else {
        query = query.ilike('company', `%${filters.company}%`);
      }
    }

    if (filters.city) {
      if (filters.city.includes('*')) {
        query = query.like('city', filters.city.replace(/\*/g, '%'));
      } else {
        query = query.ilike('city', `%${filters.city}%`);
      }
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.source) {
      if (Array.isArray(filters.source)) {
        query = query.in('source', filters.source);
      } else {
        query = query.eq('source', filters.source);
      }
    }

    // Score filters
    if (filters.score !== undefined) {
      query = query.eq('score', filters.score);
    }
    if (filters.score_gt !== undefined) {
      query = query.gt('score', filters.score_gt);
    }
    if (filters.score_lt !== undefined) {
      query = query.lt('score', filters.score_lt);
    }
    if (filters.score_between) {
      query = query.gte('score', filters.score_between[0]).lte('score', filters.score_between[1]);
    }

    // Lead value filters
    if (filters.lead_value !== undefined) {
      query = query.eq('lead_value', filters.lead_value);
    }
    if (filters.lead_value_gt !== undefined) {
      query = query.gt('lead_value', filters.lead_value_gt);
    }
    if (filters.lead_value_lt !== undefined) {
      query = query.lt('lead_value', filters.lead_value_lt);
    }
    if (filters.lead_value_between) {
      query = query.gte('lead_value', filters.lead_value_between[0]).lte('lead_value', filters.lead_value_between[1]);
    }

    // Date filters
    if (filters.created_at) {
      const date = new Date(filters.created_at);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      query = query.gte('created_at', date.toISOString()).lt('created_at', nextDay.toISOString());
    }
    if (filters.created_at_before) {
      query = query.lt('created_at', filters.created_at_before);
    }
    if (filters.created_at_after) {
      query = query.gt('created_at', filters.created_at_after);
    }
    if (filters.created_at_between) {
      query = query.gte('created_at', filters.created_at_between[0]).lte('created_at', filters.created_at_between[1]);
    }

    if (filters.is_qualified !== undefined) {
      query = query.eq('is_qualified', filters.is_qualified);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Get leads error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<Lead> = {
      data: data || [],
      page,
      limit,
      total,
      totalPages
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }
      console.error('Get lead by ID error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get lead by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Ensure score is within bounds
    if (updateData.score !== undefined) {
      updateData.score = Math.max(0, Math.min(100, updateData.score));
    }

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.user_id;

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Update lead error:', error);
      if (error.code === '23505') { // Unique violation
        res.status(400).json({ error: 'Lead with this email already exists' });
        return;
      }
      res.status(400).json({ error: error.message });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Delete lead error:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};