import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { LeadsGrid } from '../components/LeadsGrid';
import { LeadForm } from '../components/LeadForm';
import { Lead, PaginatedResponse, LeadFormData } from '../types';
import { apiService } from '../services/api';
import { Plus, Filter, Search, RefreshCw, Download } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    score_min: '',
    score_max: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Apply filters
      if (filters.search) {
        params.company = `*${filters.search}*`;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.source) {
        params.source = filters.source;
      }
      if (filters.score_min) {
        params.score_gt = parseInt(filters.score_min) - 1;
      }
      if (filters.score_max) {
        params.score_lt = parseInt(filters.score_max) + 1;
      }

      const response: PaginatedResponse<Lead> = await apiService.getLeads(params);
      setLeads(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleCreateLead = async (leadData: LeadFormData) => {
    try {
      await apiService.createLead(leadData);
      setShowForm(false);
      await fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  };

  const handleUpdateLead = async (leadData: LeadFormData) => {
    if (!editingLead) return;
    
    try {
      await apiService.updateLead(editingLead.id!, leadData);
      setEditingLead(undefined);
      setShowForm(false);
      await fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await apiService.deleteLead(id);
      await fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLead(undefined);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      source: '',
      score_min: '',
      score_max: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'Phone', 'Status', 'Source', 'Score', 'Value', 'Qualified'].join(','),
      ...leads.map(lead => [
        `"${lead.first_name} ${lead.last_name}"`,
        lead.email,
        `"${lead.company || ''}"`,
        `"${lead.phone || ''}"`,
        lead.status,
        lead.source,
        lead.score,
        lead.lead_value,
        lead.is_qualified
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600 mt-1">
              {pagination.total} total leads • Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={fetchLeads}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportLeads}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Lead</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Company
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                  <option value="won">Won</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sources</option>
                  <option value="website">Website</option>
                  <option value="facebook_ads">Facebook Ads</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="referral">Referral</option>
                  <option value="events">Events</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={filters.score_min}
                  onChange={(e) => handleFilterChange('score_min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={filters.score_max}
                  onChange={(e) => handleFilterChange('score_max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <LeadsGrid
          leads={leads}
          loading={loading}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow border">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let page;
                if (pagination.totalPages <= 5) {
                  page = i + 1;
                } else if (pagination.page <= 3) {
                  page = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  page = pagination.totalPages - 4 + i;
                } else {
                  page = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm font-medium border rounded ${
                      page === pagination.page
                        ? 'text-blue-600 bg-blue-50 border-blue-500'
                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <LeadForm
          lead={editingLead}
          onSubmit={editingLead ? handleUpdateLead : handleCreateLead}
          onCancel={handleCancelForm}
        />
      )}
    </Layout>
  );
};