import { defineConfig } from 'vitepress'
import nav from './nav.mts'
import sidebar from './sidebar.mts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Tony ⁺ 成长全书",
  description: "Tony ⁺ 成长全书",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav,
    sidebar,
    search: {
      provider: 'local',
    },
    footer: {
      message: '转载或 Copy 请标注本站原文地址',
      copyright: 'Copyright © 2022 - new精致的生活'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
