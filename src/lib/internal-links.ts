import { CATEGORIES_SEED_DATA } from "../../prisma/data/categories.ts";
import { STATES_SEED_DATA } from "../../prisma/data/states.ts";
import { GLOSSARY_TERMS } from "../data/glossary.ts";
import { getNearbyStates } from "../data/nearby-states.ts";
import { getTaskJourney } from "../data/task-journeys.ts";
import { loadAllTaskFiles } from "./queries.ts";

export interface InternalLinkAuditReport {
  totalPages: number;
  totalInternalLinks: number;
  averageInboundLinks: number;
  orphanPages: string[];
  inboundLinkCounts: Record<string, number>;
}

/**
 * Constructs the internal link graph of the entire application and
 * identifies any orphan pages (pages with zero inbound internal links).
 */
export function auditInternalLinkGraph(): InternalLinkAuditReport {
  const tasks = loadAllTaskFiles().filter((t) => t.national.status === "PUBLISHED");
  const states = STATES_SEED_DATA;
  const categories = CATEGORIES_SEED_DATA;
  const glossaryTerms = GLOSSARY_TERMS;

  // 1. Collect all published route paths
  const allPages = new Set<string>();

  allPages.add("/");
  allPages.add("/about");
  allPages.add("/how-we-verify");
  allPages.add("/disclaimer");
  allPages.add("/privacy-policy");
  allPages.add("/terms");
  allPages.add("/glossary");
  allPages.add("/my-checklists");
  allPages.add("/search");

  for (const cat of categories) {
    allPages.add(`/category/${cat.slug}`);
  }

  for (const state of states) {
    allPages.add(`/state/${state.slug}`);
  }

  for (const task of tasks) {
    allPages.add(`/${task.slug}`);
    for (const state of states) {
      allPages.add(`/${task.slug}/${state.slug}`);
    }
  }

  for (const term of glossaryTerms) {
    allPages.add(`/glossary/${term.slug}`);
  }

  // 2. Track outbound links from each page
  const outboundLinks = new Map<string, Set<string>>();

  function addLink(from: string, to: string) {
    if (!allPages.has(from) || !allPages.has(to) || from === to) return;
    if (!outboundLinks.has(from)) {
      outboundLinks.set(from, new Set());
    }
    outboundLinks.get(from)!.add(to);
  }

  // Footer links originate from every page layout
  const globalFooterLinks = [
    "/",
    "/about",
    "/how-we-verify",
    "/disclaimer",
    "/privacy-policy",
    "/terms",
    "/glossary",
    "/my-checklists",
    "/search",
  ];

  for (const page of allPages) {
    for (const footerLink of globalFooterLinks) {
      addLink(page, footerLink);
    }
  }

  // Homepage links
  for (const cat of categories) {
    addLink("/", `/category/${cat.slug}`);
  }
  for (const state of states) {
    addLink("/", `/state/${state.slug}`);
  }
  for (const task of tasks) {
    addLink("/", `/${task.slug}`);
    // State preference defaults link to Gujarat launch state
    addLink("/", `/${task.slug}/gujarat`);
  }

  // Category pages link to their tasks, other categories, home
  for (const cat of categories) {
    const catPage = `/category/${cat.slug}`;
    addLink(catPage, "/");
    const catTasks = tasks.filter((t) => t.categorySlug === cat.slug);
    for (const task of catTasks) {
      addLink(catPage, `/${task.slug}`);
    }
  }

  // State hub pages link to tasks for that state, other states, home
  for (const state of states) {
    const statePage = `/state/${state.slug}`;
    addLink(statePage, "/");
    for (const task of tasks) {
      addLink(statePage, `/${task.slug}/${state.slug}`);
    }
  }

  // Glossary index links to all terms
  for (const term of glossaryTerms) {
    addLink("/glossary", `/glossary/${term.slug}`);
    addLink(`/glossary/${term.slug}`, "/glossary");
  }

  // Task pages (national and state)
  for (const task of tasks) {
    const nationalPage = `/${task.slug}`;
    addLink(nationalPage, `/category/${task.categorySlug}`);
    addLink(nationalPage, "/");

    // Scan task text for glossary terms (tooltips link to /glossary/[slug])
    const taskJson = JSON.stringify(task).toLowerCase();
    for (const term of glossaryTerms) {
      if (taskJson.includes(term.slug) || taskJson.includes(term.termEn.toLowerCase())) {
        addLink(nationalPage, `/glossary/${term.slug}`);
      }
    }

    // Links to all state variants via state switcher
    for (const state of states) {
      addLink(nationalPage, `/${task.slug}/${state.slug}`);
    }

    // Links to journey steps
    const { journey } = getTaskJourney(task.slug);
    if (journey) {
      for (const step of journey.steps) {
        if (allPages.has(`/${step.taskSlug}`)) {
          addLink(nationalPage, `/${step.taskSlug}`);
        }
      }
    }

    // State pages
    for (const state of states) {
      const statePage = `/${task.slug}/${state.slug}`;
      addLink(statePage, nationalPage);
      addLink(statePage, `/category/${task.categorySlug}`);
      addLink(statePage, `/state/${state.slug}`);

      // Neighboring states section
      const neighbors = getNearbyStates(state.slug);
      for (const neighbor of neighbors) {
        addLink(statePage, `/${task.slug}/${neighbor.slug}`);
      }

      // Popular in state links to other tasks in same state
      for (const otherTask of tasks) {
        addLink(statePage, `/${otherTask.slug}/${state.slug}`);
      }

      // State switcher allows navigating to all other states
      for (const otherState of states) {
        addLink(statePage, `/${task.slug}/${otherState.slug}`);
      }

      // Scan state override / task text for glossary terms
      for (const term of glossaryTerms) {
        if (taskJson.includes(term.slug) || taskJson.includes(term.termEn.toLowerCase())) {
          addLink(statePage, `/glossary/${term.slug}`);
        }
      }
    }
  }

  // 3. Aggregate Inbound Links
  const inboundCounts: Record<string, number> = {};
  for (const page of allPages) {
    inboundCounts[page] = 0;
  }

  let totalInternalLinks = 0;

  for (const [, targets] of outboundLinks.entries()) {
    for (const target of targets) {
      inboundCounts[target] = (inboundCounts[target] || 0) + 1;
      totalInternalLinks++;
    }
  }

  // 4. Identify Orphans (Root "/" is entrypoint, so not an orphan)
  const orphanPages = Object.entries(inboundCounts)
    .filter(([path, count]) => path !== "/" && count === 0)
    .map(([path]) => path);

  const totalPages = allPages.size;
  const averageInboundLinks =
    totalPages > 0 ? Number((totalInternalLinks / totalPages).toFixed(1)) : 0;

  return {
    totalPages,
    totalInternalLinks,
    averageInboundLinks,
    orphanPages,
    inboundLinkCounts: inboundCounts,
  };
}
