import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

const PromptsPage = () => {
  const { API } = useContext(AuthContext);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [formData, setFormData] = useState({ title: '', prompt_text: '' });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`${API}/prompts`);
      setPrompts(response.data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPrompt) {
        await axios.put(`${API}/prompts/${editingPrompt.id}`, formData);
        toast.success('Prompt updated successfully!');
      } else {
        await axios.post(`${API}/prompts`, formData);
        toast.success('Prompt created successfully!');
      }
      setDialogOpen(false);
      setFormData({ title: '', prompt_text: '' });
      setEditingPrompt(null);
      fetchPrompts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save prompt');
    }
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setFormData({ title: prompt.title, prompt_text: prompt.prompt_text });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    try {
      await axios.delete(`${API}/prompts/${id}`);
      toast.success('Prompt deleted successfully!');
      fetchPrompts();
    } catch (error) {
      toast.error('Failed to delete prompt');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="prompts-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Custom Prompts</h1>
          <p className="text-slate-600">Create and manage your HR question templates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingPrompt(null);
            setFormData({ title: '', prompt_text: '' });
          }
        }}>
          <DialogTrigger asChild>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"
              data-testid="create-prompt-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Prompt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}</DialogTitle>
              <DialogDescription>
                {editingPrompt ? 'Update your custom prompt template' : 'Add a new custom prompt template for HR questions'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-title">Title</Label>
                <Input
                  id="prompt-title"
                  data-testid="prompt-title-input"
                  placeholder="e.g., Technical Interview Questions"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt-text">Prompt Template</Label>
                <Textarea
                  id="prompt-text"
                  data-testid="prompt-text-input"
                  placeholder="Enter your custom prompt template..."
                  value={formData.prompt_text}
                  onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                  required
                  className="bg-slate-50 min-h-[150px]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-testid="prompt-submit-button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {editingPrompt ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {prompts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence>
            {prompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`prompt-card-${prompt.id}`}
              >
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-50 p-2 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{prompt.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(prompt.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(prompt)}
                          data-testid={`edit-prompt-${prompt.id}`}
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(prompt.id)}
                          data-testid={`delete-prompt-${prompt.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-6">
                        {prompt.prompt_text}
                      </p>
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
            <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No prompts yet</h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              Create custom prompt templates to help prepare for HR questions tailored to your preferences
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"
              data-testid="create-first-prompt-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Prompt
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromptsPage;
