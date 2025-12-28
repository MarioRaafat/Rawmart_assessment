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

  const fetchTasks = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.getTasks(page);
      setTasks(response.data);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your tasks
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all" className="gap-2">
              All
              <span className="hidden sm:inline text-xs bg-secondary px-1.5 py-0.5 rounded-full">
                {taskCounts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              <span className="hidden sm:inline text-xs bg-warning/15 text-warning px-1.5 py-0.5 rounded-full">
                {taskCounts.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-2">
              In Progress
              <span className="hidden sm:inline text-xs bg-info/15 text-info px-1.5 py-0.5 rounded-full">
                {taskCounts.in_progress}
              </span>
            </TabsTrigger>
            <TabsTrigger value="done" className="gap-2">
              Done
              <span className="hidden sm:inline text-xs bg-success/15 text-success px-1.5 py-0.5 rounded-full">
                {taskCounts.done}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {tasks.length === 0 ? (
              <>
                <CheckSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first task to get started
                </p>
                <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </>
            ) : (
              <>
                <ListTodo className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground">
                  No tasks match the selected filter
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  onClick={() => fetchTasks(currentPage - 1)}
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
                  onClick={() => fetchTasks(currentPage + 1)}
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
