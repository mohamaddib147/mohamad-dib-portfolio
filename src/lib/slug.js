// URL-safe id from a title/company, used for in-page anchors (#project-…, #job-…).
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
