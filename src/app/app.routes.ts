import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'today' },
  {
    path: 'today',
    title: 'Today · Forge',
    loadComponent: () => import('./pages/today/today.component').then((m) => m.TodayComponent),
  },
  {
    path: 'progress',
    title: 'Progress · Forge',
    loadComponent: () => import('./pages/progress/progress.component').then((m) => m.ProgressComponent),
  },
  {
    path: 'atlas',
    title: 'Atlas · Forge',
    loadComponent: () => import('./pages/atlas/atlas.component').then((m) => m.AtlasComponent),
  },
  {
    path: 'patterns',
    title: 'Patterns · Forge',
    loadComponent: () => import('./pages/patterns/patterns.component').then((m) => m.PatternsComponent),
  },
  {
    path: 'system-design',
    title: 'System Design · Forge',
    loadComponent: () => import('./pages/system-design/sd-index.component').then((m) => m.SdIndexComponent),
  },
  {
    path: 'system-design/:id',
    title: 'System Design · Forge',
    loadComponent: () => import('./pages/system-design/sd-module.component').then((m) => m.SdModuleComponent),
  },
  {
    path: 'cheatsheet',
    title: 'Cheatsheet · Forge',
    loadComponent: () => import('./pages/cheatsheet/cheatsheet.component').then((m) => m.CheatsheetComponent),
  },
  {
    // A static title: the tab keeps the previous page's name otherwise, and a
    // dynamic one would need a resolver for very little gain.
    path: 'topic/:id',
    title: 'Topic · Forge',
    loadComponent: () => import('./pages/topic/topic.component').then((m) => m.TopicComponent),
  },
  { path: '**', redirectTo: 'today' },
];
