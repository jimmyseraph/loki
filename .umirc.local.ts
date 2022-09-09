import { defineConfig } from 'umi';
export default defineConfig({
  mock: {},
  proxy: {
    '/apiv4': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
});
