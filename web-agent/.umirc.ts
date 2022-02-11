import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { exact: true, path: '/', redirect: "/index"},
    { exact:true, path: '/index', component: '@/pages/index/index' },
  ],
  fastRefresh: {},
  chainWebpack: (config) => {
    config.module
      .rule('file-loader')
      .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
      .use('file-loader')
      .loader('file-loader')
      .end();
  }
});
