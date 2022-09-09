import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  favicon: '/favicon.ico',
  routes: [
    {
      exact: true,
      path: '/login',
      component: '@/pages/login/index',
    },
    {
      path: '/',
      component: '@/layouts/index',
      wrappers: ['@/wrappers/auth'],
      routes: [
        {
          path: '/',
          redirect: 'dashboard',
        },
        {
          path: 'dashboard',
          exact: true,
          component: '@/pages/dashboard/index',
        },
        {
          path: 'script',
          exact: true,
          component: '@/pages/script/index',
        },
        {
          path: 'script/new',
          exact: true,
          component: '@/pages/script/create',
        },
        {
          path: 'script/edit',
          exact: true,
          component: '@/pages/script/create',
        },
        {
          path: 'pilot',
          exact: true,
          component: '@/pages/pilot/index',
        },
        {
          path: 'report',
          exact: true,
          component: '@/pages/report/index',
        },
        {
          path: 'report/detail',
          exact: true,
          component: '@/pages/report/detail',
        },
      ],
    },
  ],
  fastRefresh: {},
  mfsu: {
    development: {
      output: './.mfsu-dev',
    },
    production: {
      output: './.mfsu-prod',
    },
  },
});
