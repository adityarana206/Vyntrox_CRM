import React from 'react';
import { useSelector } from 'react-redux';
import { TasksScreen } from '../components/screens-misc';

const TasksPage = () => {
  const authUser = useSelector(state => state.auth.user);
  return <TasksScreen authUser={authUser} />;
};

export default TasksPage;
