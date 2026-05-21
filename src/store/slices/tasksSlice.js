import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getTasks, 
  getTaskStats, 
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask 
} from '../../utils/api';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getTasks(params);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.tasks;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getTaskStats();
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getTaskById(id);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.task;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const res = await createTask(taskData);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.task;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editTask = createAsyncThunk(
  'tasks/editTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateTask(id, data);
      if (!res) throw new Error('No response');
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      return result.task;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changeTaskStatus = createAsyncThunk(
  'tasks/changeStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await updateTaskStatus(id, status);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.task;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeTask = createAsyncThunk(
  'tasks/removeTask',
  async (id, { rejectWithValue }) => {
    try {
      const res = await deleteTask(id);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  stats: null,
  loading: false,
  saving: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    resetCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch stats
      .addCase(fetchTaskStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add task
      .addCase(addTask.pending, (state) => {
        state.saving = true;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.saving = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      
      // Edit task
      .addCase(editTask.pending, (state) => {
        state.saving = true;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.tasks.findIndex(t => t._id === action.payload._id || t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && (state.currentTask._id === action.payload._id || state.currentTask.id === action.payload.id)) {
          state.currentTask = action.payload;
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      
      // Change status
      .addCase(changeTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id || t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      
      // Remove task
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload && t.id !== action.payload);
      });
  },
});

export const { clearTaskError, resetCurrentTask } = tasksSlice.actions;
export default tasksSlice.reducer;
