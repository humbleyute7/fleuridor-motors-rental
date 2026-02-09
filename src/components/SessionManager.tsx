import { Save, FolderOpen, Plus, Clock, Lock, RefreshCw, RotateCcw, User, Printer, Trash2, X, AlertTriangle } from 'lucide-react';
import { RentalSession } from '../types/rental';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface SessionManagerProps {
  currentSession: RentalSession;
  onSaveSuccess: (id: string) => void;
  onLoadSession: (session: RentalSession) => void;
  onNewSession: () => void;
  onNavigateToSection?: (sectionId: number) => void;
}

export default function SessionManager({
  currentSession,
  onSaveSuccess,
  onLoadSession,
  onNewSession,
  onNavigateToSection,
}: SessionManagerProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'plate' | 'name' | 'phone'>('plate');
  const [searchResults, setSearchResults] = useState<RentalSession[]>([]);
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [openRentals, setOpenRentals] = useState<RentalSession[]>([]);
  const [closedRentals, setClosedRentals] = useState<RentalSession[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<RentalSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRentalsByStatus();
  }, [activeTab]);

  const loadRentalsByStatus = async () => {
    setLoadingRentals(true);
    try {
      if (activeTab === 'open') {
        const { data, error } = await supabase
          .from('rental_sessions')
          .select('*')
          .in('session_status', ['pickup', 'return', 'completed'])
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setOpenRentals(data || []);
      } else {
        const { data, error } = await supabase
          .from('rental_sessions')
          .select('*')
          .eq('session_status', 'closed')
          .order('updated_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setClosedRentals(data || []);
      }
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      setLoadingRentals(false);
    }
  };

  const buildPayload = (session: RentalSession) => {
    const { id, created_at, updated_at, ...payload } = session as RentalSession & { created_at?: string; updated_at?: string };
    return payload;
  };

  const handleSaveSession = async () => {
    if (
      !currentSession.customer_name ||
      !currentSession.customer_phone ||
      !currentSession.vehicle_plate
    ) {
      alert('Please fill in at least Name, Phone, and License Plate');
      return;
    }

    setLoading(true);
    try {
      if (currentSession.id) {
        const payload = buildPayload(currentSession);
        const { error } = await supabase
          .from('rental_sessions')
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentSession.id);

        if (error) throw error;
        alert('Session updated successfully!');
        loadRentalsByStatus();
      } else {
        const payload = buildPayload(currentSession);
        const { data, error } = await supabase
          .from('rental_sessions')
          .insert(payload)
          .select()
          .maybeSingle();

        if (error) throw error;
        if (data) {
          onSaveSuccess(data.id);
          alert('Session saved successfully!');
          loadRentalsByStatus();
        }
      }
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSessions = async () => {
    if (!searchQuery) {
      alert('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('rental_sessions').select('*');

      if (searchType === 'plate') {
        query = query.eq('vehicle_plate', searchQuery.toUpperCase());
      } else if (searchType === 'name') {
        query = query.ilike('customer_name', `%${searchQuery}%`);
      } else if (searchType === 'phone') {
        query = query.ilike('customer_phone', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setSearchResults(data || []);

      if (!data || data.length === 0) {
        alert(`No sessions found for ${searchType}: ${searchQuery}`);
      }
    } catch (error) {
      console.error('Error searching sessions:', error);
      alert('Failed to search sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pickup':
        return 'bg-blue-500/20 text-blue-400';
      case 'return':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-red-500/20 text-red-400';
    }
  };

  const handleDeleteRental = async () => {
    if (!deleteConfirm?.id) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('rental_sessions')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;

      setSearchResults(prev => prev.filter(r => r.id !== deleteConfirm.id));
      setOpenRentals(prev => prev.filter(r => r.id !== deleteConfirm.id));
      setClosedRentals(prev => prev.filter(r => r.id !== deleteConfirm.id));

      if (currentSession.id === deleteConfirm.id) {
        onNewSession();
      }

      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting rental:', error);
      alert('Failed to delete rental');
    } finally {
      setDeleting(false);
    }
  };

  const rentalsToDisplay = activeTab === 'open' ? openRentals : closedRentals;

  return (
    <div className="tablet-card">
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Delete Rental</h3>
            </div>
            <p className="text-gray-300 mb-2">
              Are you sure you want to delete this rental?
            </p>
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <div className="text-white font-medium">{deleteConfirm.customer_name}</div>
              <div className="text-gray-400 text-sm">
                {deleteConfirm.vehicle_type} - {deleteConfirm.vehicle_plate}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {new Date(deleteConfirm.pickup_date).toLocaleDateString()}
              </div>
            </div>
            <p className="text-red-400 text-sm mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleDeleteRental}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <FolderOpen className="w-6 h-6 md:w-7 md:h-7 text-red-400" />
        <h2 className="tablet-heading">Session Management</h2>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <button
            onClick={handleSaveSession}
            disabled={loading}
            className="tablet-button bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 md:gap-3"
          >
            <Save className="w-5 h-5 md:w-6 md:h-6" />
            {currentSession.id ? 'Update Session' : 'Save Session'}
          </button>

          <button
            onClick={onNewSession}
            className="tablet-button bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 md:gap-3"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
            New Session
          </button>

          <div className="px-6 py-4 md:px-8 md:py-5 bg-gray-800 rounded-lg md:rounded-xl border border-gray-700">
            <div className="text-sm md:text-base text-gray-400 mb-1">Current Status</div>
            <div className="text-white font-semibold capitalize text-lg md:text-xl">
              {currentSession.session_status}
            </div>
          </div>
        </div>

        {currentSession.id && (
          <div className="bg-gray-800/50 rounded-lg md:rounded-xl p-4 md:p-5 border border-gray-700">
            <div className="text-sm md:text-base text-gray-400 mb-1">Session ID</div>
            <div className="text-red-400 font-mono text-sm md:text-base">
              {currentSession.id}
            </div>
          </div>
        )}

        <div className="border-t border-gray-700 pt-6 md:pt-8">
          <h3 className="text-white font-semibold text-lg md:text-xl mb-4 md:mb-6">Search Sessions</h3>

          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'plate' | 'name' | 'phone')}
                className="tablet-input md:w-auto"
              >
                <option value="plate">License Plate</option>
                <option value="name">Customer Name</option>
                <option value="phone">Phone Number</option>
              </select>

              <div className="flex gap-2 md:gap-3 flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(searchType === 'plate' ? value.toUpperCase() : value);
                  }}
                  className={`tablet-input flex-1 ${
                    searchType === 'plate' ? 'font-mono uppercase' : ''
                  }`}
                  placeholder={
                    searchType === 'plate'
                      ? 'Enter License Plate'
                      : searchType === 'name'
                      ? 'Enter Customer Name'
                      : 'Enter Phone Number'
                  }
                />

                <button
                  onClick={handleSearchSessions}
                  disabled={loading}
                  className="tablet-button bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2"
                >
                  <FolderOpen className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="mb-6 md:mb-8">
              <h4 className="text-gray-400 text-sm md:text-base mb-3">Search Results</h4>
              <div className="space-y-2 md:space-y-3 max-h-[300px] overflow-y-auto touch-pan-y">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-5 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <div className="text-white font-semibold text-base md:text-lg">
                        {result.customer_name}
                      </div>
                      <div className={`text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded ${getStatusColor(result.session_status)}`}>
                        {result.session_status}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:gap-3 text-sm md:text-base text-gray-400 mb-3">
                      <div>Vehicle: {result.vehicle_type}</div>
                      <div>Plate: {result.vehicle_plate}</div>
                      <div>Pickup: {new Date(result.pickup_date).toLocaleDateString()}</div>
                      <div>Return: {new Date(result.return_date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-700">
                      {result.session_status !== 'closed' ? (
                        <>
                          <button
                            onClick={() => {
                              onLoadSession(result);
                              setSearchResults([]);
                              if (onNavigateToSection) onNavigateToSection(1);
                            }}
                            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                          >
                            <User className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              onLoadSession(result);
                              setSearchResults([]);
                              if (onNavigateToSection) onNavigateToSection(7);
                            }}
                            className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Return
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(result)}
                            className="px-3 py-2 bg-red-600/20 hover:bg-red-600 active:bg-red-700 text-red-400 hover:text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              onLoadSession(result);
                              setSearchResults([]);
                              if (onNavigateToSection) onNavigateToSection(1);
                            }}
                            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                          >
                            <FolderOpen className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => {
                              onLoadSession(result);
                              setSearchResults([]);
                              if (onNavigateToSection) onNavigateToSection(8);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                          >
                            <Printer className="w-4 h-4" />
                            Print
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(result)}
                            className="px-3 py-2 bg-red-600/20 hover:bg-red-600 active:bg-red-700 text-red-400 hover:text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 pt-6 md:pt-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-white font-semibold text-lg md:text-xl">All Rentals</h3>
            <button
              onClick={loadRentalsByStatus}
              disabled={loadingRentals}
              className="tablet-button bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-sm flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loadingRentals ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="flex gap-2 md:gap-3 mb-4 md:mb-6">
            <button
              onClick={() => setActiveTab('open')}
              className={`flex-1 tablet-button flex items-center justify-center gap-2 md:gap-3 ${
                activeTab === 'open'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
              }`}
            >
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
              Open Rentals
              {openRentals.length > 0 && (
                <span className="bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full text-xs md:text-sm">
                  {openRentals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`flex-1 tablet-button flex items-center justify-center gap-2 md:gap-3 ${
                activeTab === 'closed'
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
              }`}
            >
              <Lock className="w-5 h-5 md:w-6 md:h-6" />
              Closed Rentals
              {closedRentals.length > 0 && (
                <span className="bg-gray-500/30 text-gray-300 px-2 py-0.5 rounded-full text-xs md:text-sm">
                  {closedRentals.length}
                </span>
              )}
            </button>
          </div>

          {loadingRentals ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 md:w-10 md:h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rentalsToDisplay.length > 0 ? (
            <div className="space-y-2 md:space-y-3 max-h-[400px] md:max-h-[500px] overflow-y-auto touch-pan-y">
              {rentalsToDisplay.map((rental) => (
                <div
                  key={rental.id}
                  className={`bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-5 border transition-colors ${
                    currentSession.id === rental.id
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="text-white font-semibold text-base md:text-lg">
                      {rental.customer_name}
                    </div>
                    <div className={`text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded ${getStatusColor(rental.session_status)}`}>
                      {rental.session_status}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:gap-3 text-sm md:text-base text-gray-400 mb-3">
                    <div>Vehicle: {rental.vehicle_type}</div>
                    <div>Plate: {rental.vehicle_plate}</div>
                    <div>
                      Pickup: {new Date(rental.pickup_date).toLocaleDateString()}
                    </div>
                    <div>
                      {activeTab === 'closed' ? (
                        <>Closed: {rental.updated_at ? new Date(rental.updated_at).toLocaleDateString() : 'N/A'}</>
                      ) : (
                        <>Return: {new Date(rental.return_date).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  {activeTab === 'closed' && rental.final_total && (
                    <div className="mb-3 pt-2 md:pt-3 border-t border-gray-700 flex justify-between text-sm md:text-base">
                      <span className="text-gray-400">Final Total:</span>
                      <span className="text-green-400 font-semibold">${rental.final_total.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-gray-700">
                    {activeTab === 'open' ? (
                      <>
                        <button
                          onClick={() => {
                            onLoadSession(rental);
                            if (onNavigateToSection) onNavigateToSection(1);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                        >
                          <User className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onLoadSession(rental);
                            if (onNavigateToSection) onNavigateToSection(7);
                          }}
                          className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Return
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(rental)}
                          className="px-3 py-2 bg-red-600/20 hover:bg-red-600 active:bg-red-700 text-red-400 hover:text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onLoadSession(rental);
                            if (onNavigateToSection) onNavigateToSection(1);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                        >
                          <FolderOpen className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            onLoadSession(rental);
                            if (onNavigateToSection) onNavigateToSection(8);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                        >
                          <Printer className="w-4 h-4" />
                          Print
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(rental)}
                          className="px-3 py-2 bg-red-600/20 hover:bg-red-600 active:bg-red-700 text-red-400 hover:text-white text-sm rounded-lg flex items-center justify-center gap-2 touch-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FolderOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 opacity-50" />
              <p className="text-base md:text-lg">No {activeTab} rentals found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
