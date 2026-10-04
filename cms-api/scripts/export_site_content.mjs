// One-time helper: dumps the site's current content (src/data/*.js) to
// seed/site_content.json so app/seed.py can load it into the database.
// Run from cms-api/:  node scripts/export_site_content.mjs
import { writeFileSync } from 'node:fs'
import { allProjects, projectsPageRows, getProjectBlocks } from '../../src/data/projects.js'
import { homePhotos } from '../../src/data/homePhotos.js'

const content = {
  projects: allProjects.map((project) => ({
    slug: project.id,
    title: project.title,
    category: project.category ?? null,
    description: project.description ?? null,
    tags: project.tags ?? [],
    cover_url: project.cover,
    cover_position: project.coverPosition ?? 'center',
    year: project.year ?? null,
    github_url: project.github ?? null,
    // Old galleries (images: [...]) become image blocks, same as the site shows them today
    blocks: getProjectBlocks(project).map(({ type, ...content }) => ({ type, content })),
  })),
  projects_page_rows: projectsPageRows,
  home_photos: homePhotos,
}

writeFileSync(new URL('../seed/site_content.json', import.meta.url), JSON.stringify(content, null, 2))
console.log(`Exported ${content.projects.length} projects, ${content.projects_page_rows.length} rows, ${content.home_photos.length} home photos`)
