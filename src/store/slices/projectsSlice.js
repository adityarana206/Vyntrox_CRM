import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE, getAuthHeaders } from './authSlice';

// Async thunks
export const fetchClientProjects = createAsyncThunk(
  'projects/fetchClientProjects',
  async ({ clientId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/client/projects?clientId=${clientId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch projects');
      }
      
      return data.projects;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/client/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create project');
      }
      
      return data.project;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedProject: null,
    createModalOpen: false,
  },
  reducers: {
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
    setCreateModalOpen: (state, action) => {
      state.createModalOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchClientProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClientProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch projects';
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.createModalOpen = false;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create project';
      });
  },
});

export const { setSelectedProject, clearProjectsError, setCreateModalOpen } = projectsSlice.actions;
export default projectsSlice.reducer;
