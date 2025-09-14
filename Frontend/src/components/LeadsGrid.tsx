import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Lead } from '../types';
import { Edit, Trash2 } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);


interface LeadsGridProps {
  leads: Lead[];
  loading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export const LeadsGrid: React.FC<LeadsGridProps> = ({
  leads,
  loading,
  onEdit,
  onDelete,
}) => {
  const ActionsCellRenderer = useCallback((params: any) => {
    const lead = params.data;
    
    return (
      <div className="flex items-center space-x-2 h-full">
        <button
          onClick={() => onEdit(lead)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Edit lead"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this lead?')) {
              onDelete(lead.id);
            }
          }}
          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete lead"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }, [onEdit, onDelete]);

  const StatusCellRenderer = useCallback((params: any) => {
    const status = params.value;
    const statusColors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      won: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
      }`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  }, []);

  const SourceCellRenderer = useCallback((params: any) => {
    const source = params.value;
    const sourceLabels = {
      website: 'Website',
      facebook_ads: 'Facebook Ads',
      google_ads: 'Google Ads',
      referral: 'Referral',
      events: 'Events',
      other: 'Other',
    };

    return sourceLabels[source as keyof typeof sourceLabels] || source;
  }, []);

  const ScoreCellRenderer = useCallback((params: any) => {
    const score = params.value;
    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600 bg-green-50';
      if (score >= 60) return 'text-yellow-600 bg-yellow-50';
      if (score >= 40) return 'text-orange-600 bg-orange-50';
      return 'text-red-600 bg-red-50';
    };

    return (
      <div className="flex items-center h-full">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
    );
  }, []);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Name',
      field: 'first_name',
      width: 150,
      valueGetter: (params) => `${params.data.first_name} ${params.data.last_name}`,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <div>
            <div className="font-medium text-gray-900">
              {params.data.first_name} {params.data.last_name}
            </div>
            <div className="text-sm text-gray-500">{params.data.email}</div>
          </div>
        </div>
      ),
    },
    {
      headerName: 'Company',
      field: 'company',
      width: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <div>
            <div className="font-medium text-gray-900">{params.value || '-'}</div>
            <div className="text-sm text-gray-500">
              {params.data.city && params.data.state 
                ? `${params.data.city}, ${params.data.state}`
                : params.data.city || params.data.state || '-'
              }
            </div>
          </div>
        </div>
      ),
    },
    {
      headerName: 'Phone',
      field: 'phone',
      width: 140,
      valueFormatter: (params) => params.value || '-',
    },
    {
      headerName: 'Source',
      field: 'source',
      width: 120,
      cellRenderer: SourceCellRenderer,
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: 'Score',
      field: 'score',
      width: 90,
      cellRenderer: ScoreCellRenderer,
    },
    {
      headerName: 'Value',
      field: 'lead_value',
      width: 120,
      valueFormatter: (params) => params.value ? `$${Number(params.value).toLocaleString()}` : '$0',
      cellClass: 'font-medium',
    },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      width: 100,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <span className={`w-3 h-3 rounded-full ${
            params.value ? 'bg-green-500' : 'bg-gray-300'
          }`} />
        </div>
      ),
    },
    {
      headerName: 'Created',
      field: 'created_at',
      width: 120,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 100,
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
      resizable: false,
      pinned: 'right',
    },
  ], [ActionsCellRenderer, StatusCellRenderer, SourceCellRenderer, ScoreCellRenderer]);

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="ag-theme-alpine w-full h-[600px] bg-white rounded-lg shadow border">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading leads...</span>
          </div>
        </div>
      )}
      
      <AgGridReact
        rowData={leads}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={false}
        rowHeight={60}
        headerHeight={50}
        animateRows={true}
        onGridReady={onGridReady}
        suppressRowClickSelection={true}
        rowSelection="single"
      />
    </div>
  );
};