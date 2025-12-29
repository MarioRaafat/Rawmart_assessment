import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, CreateTaskData } from '@/types';
import { api } from '@/services/api';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, AlertCircle, CheckSquare, ListTodo } from 'lucide-react';

type FilterStatus = 'all' | TaskStatus;

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { toast } = useToast();

  const fetchTasks = useCallback(async (page: number = 1, status: FilterStatus = filter) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.getTasks(page, 10, status === 'all' ? undefined : status);
      setTasks(response.data);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks(1, filter);
  }, [fetchTasks, filter]);

  const handleCreateTask = async (data: CreateTaskData) => {
    const newTask = await api.createTask(data);
    setTasks((prev) => [newTask, ...prev]);
    toast({
      title: 'Task created',
      description: 'Your new task has been created successfully.',
    });
  };

  const handleUpdateTask = async (data: CreateTaskData) => {
    if (!editingTask) return;
    const updatedTask = await api.updateTask(editingTask.id, data);
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditingTask(null);
    toast({
      title: 'Task updated',
      description: 'Your task has been updated successfully.',
    });
  };

  const handleUpdateStatus = async (id: number, status: TaskStatus) => {
    const updatedTask = await api.updateTask(id, { status });
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    toast({
      title: 'Status updated',
      description: `Task marked as ${status.replace('_', ' ')}.`,
    });
  };

  const handleDeleteTask = async (id: number) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast({
      title: 'Task deleted',
      description: 'The task has been deleted successfully.',
    });
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full max-w-[1920px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
             <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">My Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your tasks
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)} className="mb-8">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
            <TabsList className="w-full sm:w-auto inline-flex h-11">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            {tasks.length === 0 ? (
              <>
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <CheckSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-foreground">No tasks yet</h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg">
                  Create your first task to get started and simplify your workflow.
                </p>
                <Button onClick={() => setIsFormOpen(true)} size="lg" className="gap-2 text-base px-8">
                  <Plus className="h-5 w-5" />
                  Add New Task
                </Button>
              </>
            ) : (
              <>
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <ListTodo className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-foreground">No tasks found</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  No tasks match the selected filter criteria.
                </p>
                <Button variant="outline" onClick={() => setFilter('all')} className="mt-2 text-base font-medium">
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteTask}
                  onEdit={openEditForm}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTasks(currentPage - 1, filter)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTasks(currentPage + 1, filter)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <TaskForm
        open={isFormOpen}
        onOpenChange={closeForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  );
};

export default Dashboard;
