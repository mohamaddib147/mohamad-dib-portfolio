import { ArrowUpRight, ExternalLink } from "lucide-react";
import { STYLE_PRESETS, ICON_MAP } from "../../data/projectPresets";

// Mirrors the public project card markup/classes in src/sections/Projects.jsx
// so what the admin sees while typing matches what ships to the live site.
function ProjectPreviewCard({ form }) {
  const preset = STYLE_PRESETS[form.styleKey] ?? STYLE_PRESETS.software;
  const Icon = ICON_MAP[form.iconName] ?? ICON_MAP.Cpu;
  const highlights = form.highlights.split("\n").map((l) => l.trim()).filter(Boolean);
  const tech = form.tech.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className={`project-data-card refined-project-card project-card-unique admin-preview-card ${preset.accent} ${preset.layout}`}>
      {form.image_url && (
        <div className="admin-preview-image">
          <img src={form.image_url} alt="" />
        </div>
      )}

      <div className="project-top-shell">
        <div className="project-card-top">
          <p className="project-meta">{form.meta || "Meta line…"}</p>
          <span className="project-type-badge">{form.badge || "Badge"}</span>
        </div>
        <div className="project-icon-wrap">
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>

      <div className="project-role-line">
        <span className="project-role-label">Role</span>
        <span className="project-role-value">{form.role || "—"}</span>
      </div>

      <h3>{form.title || "Untitled project"}</h3>
      <p className="project-summary">{form.summary || "Summary appears here…"}</p>
      <p className="project-description">{form.description}</p>

      {highlights.length > 0 && (
        <div className="project-highlight-block">
          {highlights.map((highlight, i) => (
            <div className="project-highlight-item" key={i}>
              <span className="project-highlight-dot" />
              <p>{highlight}</p>
            </div>
          ))}
        </div>
      )}

      {form.demo_link && (
        <span className="project-demo-link">
          <ExternalLink size={14} strokeWidth={2} />
          Live Demo
        </span>
      )}

      <div className="project-card-footer">
        <div className="project-tag-list">
          {tech.map((tag, i) => (
            <span className="project-tag" key={i}>{tag}</span>
          ))}
        </div>
        <span className="project-arrow-mark project-arrow-mark-disabled" aria-hidden="true">
          <ArrowUpRight size={16} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

export default ProjectPreviewCard;
