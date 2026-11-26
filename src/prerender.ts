import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { createRouter, createMemoryHistory } from "vue-router";
import SeoLandingPage from "@/components/page-layout/SeoLandingPage.vue";
import BlogView from "@/views/BlogView.vue";
import {
  pixelGuessrLanding, jackboxLanding, garticLanding,
  pictureRevealLanding, phoneControllerLanding, afterworkLanding,
} from "@/data/seoLandingPages";
import { blogRoute, seoLandingRoutes } from "@/data/seoLandingMeta";
import type { SeoLandingContent } from "@/data/seoLandingPages";

const pages: Record<string, SeoLandingContent> = {
  "/free-pixel-guessr-alternative": pixelGuessrLanding,
  "/free-jackbox-alternative": jackboxLanding,
  "/free-skribbl-and-gartic-alternative": garticLanding,
  "/picture-reveal-game": pictureRevealLanding,
  "/phone-controller-party-game": phoneControllerLanding,
  "/friday-afterwork-game": afterworkLanding,
};

export const landingDefinitions = Object.entries(seoLandingRoutes).map(([path, route]) => ({
  path, ...route, page: pages[path]!,
}));

export const prerenderDefinitions = [
  ...landingDefinitions.map(definition => ({ ...definition, requiredSchema: "FAQPage" })),
  { path: "/blog", ...blogRoute, requiredSchema: "Blog" },
];

export async function renderPage(path: string) {
  const page = pages[path];
  if (!page && path !== "/blog") throw new Error(`Unknown static page: ${path}`);
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/:pathMatch(.*)*", component: { render: () => null } }],
  });
  // Match the app's visual shell without starting browser stores, audio or APIs.
  const app = createSSRApp({
    render: () => h("div", [
      h("div", { class: "pixelCon" }, Array.from({ length: 80 }, () => h("div", { class: "pixel" }))),
      h("div", { class: "app-container" }, [page ? h(SeoLandingPage, { page }) : h(BlogView)]),
    ]),
  });
  app.use(router);
  await router.push(path);
  await router.isReady();
  return renderToString(app);
}
