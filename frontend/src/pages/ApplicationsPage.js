import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Briefcase, Loader2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

const ApplicationsPage = () => {
  const { API } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    platform: '',
    status: 'Applied',
    salary_range: '',
    notes: '',
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API}/applications`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApps(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingApp) {
        await axios.put(`${API}/applications/${editingApp.id}`, formData);
        toast.success('Application updated successfully!');
      } else {
        await axios.post(`${API}/applications`, formData);
        toast.success('Application created successfully!');
      }
      setDialogOpen(false);
      resetForm();
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save application');
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setFormData({
      company_name: app.company_name,
      role: app.role,
      platform: app.platform,
      status: app.status,
      salary_range: app.salary_range || '',
      notes: app.notes || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await axios.delete(`${API}/applications/${id}`);
      toast.success('Application deleted successfully!');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to delete application');
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      role: '',
      platform: '',
      status: 'Applied',
      salary_range: '',
      notes: '',
    });
    setEditingApp(null);
  };

  const getStatusBadge = (status) => {
    const styles = {
      Applied: 'bg-indigo-100 text-indigo-700',
      Interview: 'bg-violet-100 text-violet-700',
      Offer: 'bg-emerald-100 text-emerald-700',
      Rejected: 'bg-rose-100 text-rose-700',
    };
    return styles[status] || styles.Applied;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="applications-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Job Applications</h1>
          <p className="text-slate-600">Track all your job applications in one place</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"
              data-testid="create-application-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingApp ? 'Edit Application' : 'Add New Application'}</DialogTitle>
              <DialogDescription>
                {editingApp ? 'Update application details' : 'Track a new job application'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    data-testid="application-company-input"
                    placeholder="Google"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    data-testid="application-role-input"
                    placeholder="Software Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    className="bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Input
                    id="platform"
                    data-testid="application-platform-input"
                    placeholder="LinkedIn"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    required
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger data-testid="application-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-range">Salary Range</Label>
                <Input
                  id="salary-range"
                  data-testid="application-salary-input"
                  placeholder="$100k - $150k"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  data-testid="application-notes-input"
                  placeholder="Additional details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-slate-50"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-testid="application-submit-button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {editingApp ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by company or role..."
                data-testid="application-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="application-filter-select">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApps.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <AnimatePresence>
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
                data-testid={`application-card-${app.id}`}
              >
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-50 p-3 rounded-xl">
                          <Briefcase className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{app.company_name}</h3>
                          <p className="text-slate-600">{app.role}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span>Platform: {app.platform}</span>
                            <span>•</span>
                            <span>{new Date(app.applied_date).toLocaleDateString()}</span>
                          </div>
                          {app.salary_range && (
                            <p className="text-sm text-slate-600 mt-1">💰 {app.salary_range}</p>
                          )}
                          {app.notes && (
                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{app.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(app)}
                          data-testid={`edit-application-${app.id}`}
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(app.id)}
                          data-testid={`delete-application-${app.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm || statusFilter !== 'All' ? 'No matching applications' : 'No applications yet'}
            </h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              {searchTerm || statusFilter !== 'All'
                ? 'Try adjusting your filters'
                : 'Start tracking your job applications and stay organized'}
            </p>
            {!searchTerm && statusFilter === 'All' && (
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"
                data-testid="create-first-application-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Application
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationsPage;
