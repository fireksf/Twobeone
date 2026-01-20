import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Loader2, X, MessageCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '../../utils/supabase/client';

const supabase = createClient();

type QuestionType = 'text' | 'multiple_choice' | 'multiple_select' | 'like_dislike' | 'love_hate' | 'scale' | 'yes_no';

interface Question {
  id: string;
  category: string;
  title: string;
  verse: string;
  verseReference: string;
  prompts: QuestionPrompt[];
  status: 'active' | 'inactive';
  language?: string; // Add language field
}

interface QuestionPrompt {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  scaleMax?: number;
}

interface QuestionsManagerProps {
  accessToken?: string;
}

export function QuestionsManager({ accessToken: propAccessToken }: QuestionsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(propAccessToken || null);

  const categories = [
    'daily-life',
    'intimacy',
    'love-balance',
    'dream-wedding',
    'travel',
    'boundaries',
    'trust',
    'kids-future',
    'finance',
    'family',
    'bible',
  ];

  const questionTypes: { value: QuestionType; label: string; description: string }[] = [
    { value: 'text', label: 'Text Response', description: 'Free text answer' },
    { value: 'multiple_choice', label: 'Multiple Choice', description: 'Select one option' },
    { value: 'multiple_select', label: 'Multiple Select', description: 'Select multiple options' },
    { value: 'like_dislike', label: 'Like/Dislike', description: 'Thumbs up or down' },
    { value: 'love_hate', label: 'Love/Hate', description: 'Heart or broken heart' },
    { value: 'scale', label: 'Rating Scale', description: '1-5 or 1-10 scale' },
    { value: 'yes_no', label: 'Yes/No', description: 'Simple yes or no' },
  ];

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadQuestions();
    loadAccessToken();
  }, []);

  const loadAccessToken = async () => {
    // If we have a prop token, use it; otherwise refresh from session
    if (propAccessToken) {
      setAccessToken(propAccessToken);
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setAccessToken(session.access_token);
    }
  };

  const loadQuestions = async () => {
    try {
      // Use prop token if available, otherwise try to get fresh session
      let token = propAccessToken;
      
      if (!token) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
      }
      
      if (!token) {
        toast.error('No valid session. Please sign in again.');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/questions/list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const { questions: fetchedQuestions } = await response.json();
        setQuestions(fetchedQuestions || []);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState<Partial<Question>>({
    title: '',
    category: 'daily-life',
    verse: '',
    verseReference: '',
    prompts: [],
    status: 'active',
    language: 'en', // Default to English
  });

  const addPrompt = () => {
    setFormData({
      ...formData,
      prompts: [
        ...(formData.prompts || []),
        {
          id: Date.now().toString(),
          text: '',
          type: 'text',
        },
      ],
    });
  };

  const removePrompt = (index: number) => {
    const newPrompts = [...(formData.prompts || [])];
    newPrompts.splice(index, 1);
    setFormData({ ...formData, prompts: newPrompts });
  };

  const updatePrompt = (index: number, updates: Partial<QuestionPrompt>) => {
    const newPrompts = [...(formData.prompts || [])];
    newPrompts[index] = { ...newPrompts[index], ...updates };
    
    // Reset options when changing question type
    if (updates.type && !['multiple_choice', 'multiple_select'].includes(updates.type)) {
      newPrompts[index].options = undefined;
    }
    if (updates.type && updates.type !== 'scale') {
      newPrompts[index].scaleMax = undefined;
    }
    
    setFormData({ ...formData, prompts: newPrompts });
  };

  const addOption = (promptIndex: number) => {
    const newPrompts = [...(formData.prompts || [])];
    newPrompts[promptIndex].options = [...(newPrompts[promptIndex].options || []), ''];
    setFormData({ ...formData, prompts: newPrompts });
  };

  const updateOption = (promptIndex: number, optionIndex: number, value: string) => {
    const newPrompts = [...(formData.prompts || [])];
    const options = [...(newPrompts[promptIndex].options || [])];
    options[optionIndex] = value;
    newPrompts[promptIndex].options = options;
    setFormData({ ...formData, prompts: newPrompts });
  };

  const removeOption = (promptIndex: number, optionIndex: number) => {
    const newPrompts = [...(formData.prompts || [])];
    const options = [...(newPrompts[promptIndex].options || [])];
    options.splice(optionIndex, 1);
    newPrompts[promptIndex].options = options;
    setFormData({ ...formData, prompts: newPrompts });
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData(question);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(id);
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const token = accessToken || publicAnonKey;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/questions/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== id));
        toast.success('Question deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Delete question error:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validPrompts = formData.prompts?.filter(p => p.text.trim()) || [];
    if (validPrompts.length < 1) {
      toast.error('Please add at least one question prompt');
      return;
    }

    // Validate prompts with options
    for (const prompt of validPrompts) {
      if (['multiple_choice', 'multiple_select'].includes(prompt.type)) {
        const validOptions = prompt.options?.filter(o => o.trim()) || [];
        if (validOptions.length < 2) {
          toast.error(`Please provide at least 2 options for "${prompt.text}"`);
          return;
        }
        prompt.options = validOptions;
      }
    }

    if (editingQuestion) {
      updateQuestion({ ...formData, prompts: validPrompts } as Question);
    } else {
      createQuestion({ ...formData, prompts: validPrompts } as Question);
    }
  };

  const createQuestion = async (question: Partial<Question>) => {
    try {
      const token = accessToken || publicAnonKey;
      
      console.log('Creating question:', question);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/questions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(question)
        }
      );

      console.log('Create response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Create response:', result);
        toast.success('Question created successfully');
        loadQuestions(); // Reload questions from backend
        resetForm();
      } else {
        const error = await response.json();
        console.error('Create error response:', error);
        toast.error(error.error || 'Failed to create question');
      }
    } catch (error) {
      console.error('Create question error:', error);
      toast.error('Failed to create question');
    }
  };

  const updateQuestion = async (question: Question) => {
    try {
      const token = accessToken || publicAnonKey;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/questions/${question.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(question)
        }
      );

      if (response.ok) {
        toast.success('Question updated successfully');
        loadQuestions(); // Reload questions from backend
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update question');
      }
    } catch (error) {
      console.error('Update question error:', error);
      toast.error('Failed to update question');
    }
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingQuestion(null);
    setFormData({
      title: '',
      category: 'daily-life',
      verse: '',
      verseReference: '',
      prompts: [],
      status: 'active',
      language: 'en', // Default to English
    });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.verseReference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getQuestionTypeLabel = (type: QuestionType) => {
    return questionTypes.find(qt => qt.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[24px]">Q&A Discussion Questions</h2>
          <p className="text-sm text-gray-600 text-[16px]">Manage conversation topics with flexible question types</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              size="sm"
              onClick={() => {
                setEditingQuestion(null);
                setFormData({
                  title: '',
                  category: 'daily-life',
                  verse: '',
                  verseReference: '',
                  prompts: [],
                  status: 'active',
                  language: 'en', // Default to English
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] w-full">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {editingQuestion ? 'Update the details of this Q&A question.' : 'Create a new question for couples to answer and discuss together.'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-2 sm:pr-4">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-xs sm:text-sm">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 text-xs sm:text-sm"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-xs sm:text-sm">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 text-xs sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" className="text-xs sm:text-sm">Question Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Morning Routines & Quiet Time"
                    required
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="verse" className="text-xs sm:text-sm">Bible Verse</Label>
                  <Textarea
                    id="verse"
                    value={formData.verse}
                    onChange={(e) => setFormData({ ...formData, verse: e.target.value })}
                    placeholder="Enter the full Bible verse text"
                    rows={3}
                    required
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="reference" className="text-xs sm:text-sm">Verse Reference</Label>
                  <Input
                    id="reference"
                    value={formData.verseReference}
                    onChange={(e) => setFormData({ ...formData, verseReference: e.target.value })}
                    placeholder="e.g., Mark 1:35"
                    required
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="language" className="text-xs sm:text-sm">Language</Label>
                  <select
                    id="language"
                    value={formData.language || 'en'}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-xs sm:text-sm"
                  >
                    <option value="en">🌍 English</option>
                    <option value="am">🌍 አማርኛ (Amharic)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the language for this question. Users can filter questions by language.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label className="text-xs sm:text-sm">Discussion Questions</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPrompt} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Question
                    </Button>
                  </div>

                  {(formData.prompts || []).map((prompt, promptIndex) => (
                    <Card key={prompt.id} className="p-3 sm:p-4 space-y-3 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removePrompt(promptIndex)}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>

                      <div className="pr-8">
                        <Label className="text-xs sm:text-sm">Question Type</Label>
                        <select
                          value={prompt.type}
                          onChange={(e) => updatePrompt(promptIndex, { type: e.target.value as QuestionType })}
                          className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1 text-xs sm:text-sm"
                        >
                          {questionTypes.map(qt => (
                            <option key={qt.value} value={qt.value}>
                              {qt.label} - {qt.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs sm:text-sm">Question Text</Label>
                        <Textarea
                          value={prompt.text}
                          onChange={(e) => updatePrompt(promptIndex, { text: e.target.value })}
                          placeholder="Enter your question..."
                          rows={2}
                          className="mt-1 text-xs sm:text-sm"
                          required
                        />
                      </div>

                      {/* Multiple Choice / Multiple Select Options */}
                      {['multiple_choice', 'multiple_select'].includes(prompt.type) && (
                        <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-purple-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <Label className="text-xs sm:text-sm">Answer Options</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(promptIndex)}
                              className="w-full sm:w-auto"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          {(prompt.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(promptIndex, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                required
                                className="text-xs sm:text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(promptIndex, optionIndex)}
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Scale Options */}
                      {prompt.type === 'scale' && (
                        <div className="pl-2 sm:pl-4 border-l-2 border-purple-200">
                          <Label className="text-xs sm:text-sm">Scale Maximum</Label>
                          <select
                            value={prompt.scaleMax || 5}
                            onChange={(e) => updatePrompt(promptIndex, { scaleMax: parseInt(e.target.value) })}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 mt-1 text-xs sm:text-sm"
                          >
                            <option value="5">1-5 Scale</option>
                            <option value="10">1-10 Scale</option>
                          </select>
                        </div>
                      )}
                    </Card>
                  ))}

                  {(!formData.prompts || formData.prompts.length === 0) && (
                    <Card className="p-6 sm:p-8 text-center border-dashed">
                      <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs sm:text-sm">No questions added yet</p>
                      <p className="text-gray-400 text-xs">Click "Add Question" to get started</p>
                    </Card>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 sm:flex-1">
                    {editingQuestion ? 'Update' : 'Create'} Question
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        <Card className="lg:col-span-8 p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 text-xs sm:text-sm text-[14px]"
            />
          </div>
        </Card>
        <Card className="lg:col-span-4 p-3 sm:p-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-gray-300 text-xs sm:text-sm text-[14px]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 text-[14px] font-bold">Total Questions</p>
          <p className="text-xl sm:text-2xl font-semibold font-bold">{questions.length}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 text-[14px] font-bold">Active</p>
          <p className="text-xl sm:text-2xl font-semibold text-green-600 font-bold">
            {questions.filter(q => q.status === 'active').length}
          </p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 text-[14px] font-bold">Categories</p>
          <p className="text-xl sm:text-2xl font-semibold font-bold">{categories.length}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 text-[13px] font-bold">Total Prompts</p>
          <p className="text-xl sm:text-2xl font-semibold font-bold">
            {questions.reduce((sum, q) => sum + q.prompts.length, 0)}
          </p>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                  <h3 className="font-semibold text-base sm:text-lg font-bold">{question.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {question.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Badge>
                  <Badge variant={question.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {question.status}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 italic mb-3 font-bold">{question.verseReference}</p>
                <div className="space-y-2">
                  {question.prompts.map((prompt, index) => (
                    <div key={prompt.id} className="text-xs sm:text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium font-bold">{index + 1}.</span>
                        <span className="text-gray-700">{prompt.text}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getQuestionTypeLabel(prompt.type)}
                        </Badge>
                      </div>
                      {prompt.options && prompt.options.length > 0 && (
                        <div className="ml-4 sm:ml-6 mt-1 text-xs text-gray-500">
                          Options: {prompt.options.join(', ')}
                        </div>
                      )}
                      {prompt.type === 'scale' && (
                        <div className="ml-4 sm:ml-6 mt-1 text-xs text-gray-500">
                          Scale: 1-{prompt.scaleMax || 5}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(question)}
                  className="text-xs"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(question.id)}
                  className="text-xs"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}