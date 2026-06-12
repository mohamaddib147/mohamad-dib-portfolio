function ProjectCard({ title, description, tech }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      <p>{tech}</p>
    </div>
  );
}

export default ProjectCard;