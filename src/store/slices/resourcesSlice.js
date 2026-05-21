import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getResources, 
  getResourceById,
  getResourceAvailability,
  getAllocationStats,
  updateResource 
} from '../../utils/api';

// Async thunks
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getResources(params);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.resources;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchResourceById = createAsyncThunk(
  'resources/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getResourceById(id);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.resource;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchResourceAvailability = createAsyncThunk(
  'resources/fetchAvailability',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getResourceAvailability(id);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return { id, availability: data.availability };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllocationStats = createAsyncThunk(
  'resources/fetchAllocation',
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

export const editResource = createAsyncThunk(
  'resources/editResource',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateResource(id, data);
      if (!res) throw new Error('No response');
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      return result.resource;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  resources: [],
  currentResource: null,
  allocation: [],
  loading: false,
  saving: false,
  error: null,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    clearResourceError: (state) => {
      state.error = null;
    },
    resetCurrentResource: (state) => {
      state.currentResource = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch resources
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch by ID
      .addCase(fetchResourceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch allocation
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
      })
      
      // Edit resource
      .addCase(editResource.pending, (state) => {
        state.saving = true;
      })
      .addCase(editResource.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.resources.findIndex(r => r._id === action.payload._id || r.id === action.payload.id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
        if (state.currentResource && (state.currentResource._id === action.payload._id || state.currentResource.id === action.payload.id)) {
          state.currentResource = action.payload;
        }
      })
      .addCase(editResource.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearResourceError, resetCurrentResource } = resourcesSlice.actions;
export default resourcesSlice.reducer;
