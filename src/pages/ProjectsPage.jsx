import React from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectsScreen from '../components/projects';

const ProjectsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [selectedProject, setSelectedProject] = React.useState(projectId || null);

  // Sync selectedProject with URL param when it changes
  React.useEffect(() => {
    setSelectedProject(projectId || null);
  }, [projectId]);

  const handleSelectProject = (id) => {
    setSelectedProject(id);
    if (id) {
      navigate(`/projects/${id}`);
    } else {
      navigate('/projects');
    }
  };

  return (
    <ProjectsScreen 
      role={user?.role}
      selectedProject={selectedProject}
      setSelectedProject={handleSelectProject}
      authUser={user}
    />
  );
};

export default ProjectsPage;
