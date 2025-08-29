const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // 提供 Next.js 应用的路径以加载 next.config.js 和 .env 文件
  dir: './',
})

// 自定义 Jest 配置
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // 处理模块别名（这与 tsconfig.json 和 next.config.js 中的路径匹配）
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    // 测试中通过 jest.setup.js 进行 mock，因此无需特殊映射
  },
  transformIgnorePatterns: ['/node_modules/'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
}

// createJestConfig 是 async 的，所以需要等待它返回配置
module.exports = createJestConfig(customJestConfig) 