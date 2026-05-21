import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE, getAuthHeaders } from './authSlice';

// Async thunks
export const fetchAllTickets = createAsyncThunk(
  'tickets/fetchAllTickets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/tickets?${query}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch tickets');
      }
      
      return data.tickets;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchClientTickets = createAsyncThunk(
  'tickets/fetchClientTickets',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/client/tickets?clientId=${clientId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch tickets');
      }
      
      return data.tickets;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (ticketData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/client/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(ticketData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create ticket');
      }
      
      return data.ticket;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedTicket: null,
  },
  reducers: {
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload;
    },
    clearTicketsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tickets (admin)
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tickets';
      })
      // Fetch client tickets
      .addCase(fetchClientTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClientTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tickets';
      })
      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create ticket';
      });
  },
});

export const { setSelectedTicket, clearTicketsError } = ticketsSlice.actions;
export default ticketsSlice.reducer;
