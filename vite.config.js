import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 环境变量配置
  envPrefix: 'VITE_',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@config': path.resolve(__dirname, 'src/config'),
    }
  },
  // 开发服务器配置
  server: {
    allowedHosts: [
      '*'
    ],
  },
  // 构建优化配置
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: false,
    // 配置文件大小阈值
    chunkSizeWarningLimit: 2000,
    // 配置 rollup 选项
    rollupOptions: {
      output: {
        // 对代码进行分块
        manualChunks(id) {
          // 基础依赖包
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vendor'
            }
            if (id.includes('@vueuse') || id.includes('radix-vue') || id.includes('lucide-vue-next') ||
                id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui'
            }
            return 'deps'
          }
          // 合并相似功能的页面组件
          if (id.includes('/src/pages/')) {
            if (id.includes('Course')) {
              return 'course-pages'
            }
            if (id.includes('Order')) {
              return 'order-pages'
            }
            if (id.includes('Practice') || id.includes('Question') || id.includes('Exam')) {
              return 'exam-pages'
            }
            return 'other-pages'
          }
        },
        // 用于从入口点创建的块的打包输出格式
        entryFileNames: 'assets/[name].[hash].js',
        // 用于命名代码分割时创建的共享块的输出命名
        chunkFileNames: 'assets/[name].[hash].js',
        // 用于输出静态资源的命名
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // 启用最小化混淆
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})