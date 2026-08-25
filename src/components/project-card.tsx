import Image from "next/image";
import type { Project } from "@/data/portfolio";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className={`project-card ${project.featured ? "project-card-featured" : ""}`}>
      <div className="project-image">
        <Image src={project.image} alt={project.imageAlt} width={1536} height={1024} loading="eager" unoptimized sizes={project.featured ? "(max-width: 760px) 100vw, 100vw" : "(max-width: 760px) 100vw, 50vw"} />
      </div>
      <div className="project-content">
        <div className="project-topline"><span>0{index + 1}</span><p>{project.category}</p>{project.note && <small>{project.note}</small>}</div>
        <h3>{project.name}</h3>
        <p className="project-description">{project.description}</p>
        <ul className="capabilities" aria-label={`${project.name} capabilities`}>{project.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
      </div>
    </article>
  );
}
