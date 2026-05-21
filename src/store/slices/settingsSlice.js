import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getSettings, 
  updateProfile,
  updatePreferences,
  changePassword,
  getNotificationSettings,
  updateNotificationSettings,
  getSystemSettings 
} from '../../utils/api';

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getSettings();
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.settings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveProfile = createAsyncThunk(
  'settings/saveProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await updateProfile(profileData);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const savePreferences = createAsyncThunk(
  'settings/savePreferences',
  async (preferencesData, { rejectWithValue }) => {
    try {
      const res = await updatePreferences(preferencesData);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.preferences;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const savePassword = createAsyncThunk(
  'settings/savePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.message;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNotificationSettings = createAsyncThunk(
  'settings/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getNotificationSettings();
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.notifications;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveNotificationSettings = createAsyncThunk(
  'settings/saveNotifications',
  async (notificationsData, { rejectWithValue }) => {
    try {
      const res = await updateNotificationSettings(notificationsData);
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.notifications;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSystemSettings = createAsyncThunk(
  'settings/fetchSystem',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getSystemSettings();
      if (!res) throw new Error('No response');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.system;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  settings: null,
  profile: null,
  preferences: null,
  notifications: null,
  system: null,
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.profile = action.payload.profile;
        state.preferences = action.payload.preferences;
        state.notifications = action.payload.preferences?.notifications;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Save profile
      .addCase(saveProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload;
        state.successMessage = 'Profile updated successfully';
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      
      // Save preferences
      .addCase(savePreferences.pending, (state) => {
        state.saving = true;
      })
      .addCase(savePreferences.fulfilled, (state, action) => {
        state.saving = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.successMessage = 'Preferences updated successfully';
      })
      .addCase(savePreferences.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      
      // Save password
      .addCase(savePassword.pending, (state) => {
        state.saving = true;
      })
      .addCase(savePassword.fulfilled, (state) => {
        state.saving = false;
        state.successMessage = 'Password changed successfully';
      })
      .addCase(savePassword.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      
      // Fetch notifications
      .addCase(fetchNotificationSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotificationSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Save notifications
      .addCase(saveNotificationSettings.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveNotificationSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.notifications = action.payload;
        state.successMessage = 'Notification settings updated successfully';
      })
      .addCase(saveNotificationSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      
      // Fetch system settings
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.system = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSettingsError, clearSuccessMessage, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
