import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ticketsReducer from './slices/ticketsSlice';
import projectsReducer from './slices/projectsSlice';
import dashboardReducer from './slices/dashboardSlice';
import tasksReducer from './slices/tasksSlice';
import resourcesReducer from './slices/resourcesSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketsReducer,
    projects: projectsReducer,
    dashboard: dashboardReducer,
    tasks: tasksReducer,
    resources: resourcesReducer,
    settings: settingsReducer,
  },
});
