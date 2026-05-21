import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getDashboardStats, 
  getDashboardTickets, 
  getDashboardProjects, 
  getDashboardTasks,
  getTeamWorkload,
  getAllocationStats 
} from '../../utils/api';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async ({ role, userId }, { rejectWithValue }) => {
    try {
      const res = await getDashboardStats(role, userId);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDashboardTickets = createAsyncThunk(
  'dashboard/fetchTickets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getDashboardTickets(params);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.tickets;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDashboardProjects = createAsyncThunk(
  'dashboard/fetchProjects',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getDashboardProjects(params);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.projects;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDashboardTasks = createAsyncThunk(
  'dashboard/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getDashboardTasks(params);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.tasks;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTeamWorkload = createAsyncThunk(
  'dashboard/fetchTeamWorkload',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getTeamWorkload();
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.workload;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllocationStats = createAsyncThunk(
  'dashboard/fetchAllocationStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllocationStats();
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.allocation;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  stats: null,
  tickets: [],
  projects: [],
  tasks: [],
  teamWorkload: [],
  allocation: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Tickets
      .addCase(fetchDashboardTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchDashboardTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Projects
      .addCase(fetchDashboardProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchDashboardProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Tasks
      .addCase(fetchDashboardTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchDashboardTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Team Workload
      .addCase(fetchTeamWorkload.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeamWorkload.fulfilled, (state, action) => {
        state.loading = false;
        state.teamWorkload = action.payload;
      })
      .addCase(fetchTeamWorkload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Allocation
      .addCase(fetchAllocationStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllocationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.allocation = action.payload;
      })
      .addCase(fetchAllocationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
