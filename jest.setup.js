import '@testing-library/jest-dom'
import React from 'react'

// 测试环境变量
process.env.SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'unit-test-key'

// 模拟 next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// 模拟 next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// 全局测试配置
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// 抑制 console.error 在测试中的输出
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 

// ESM 组件简化 mock，避免解析/样式干扰
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: (props) => React.createElement(React.Fragment, null, props.children),
}))

jest.mock('react-syntax-highlighter', () => ({
  Prism: (props) => React.createElement('pre', null, props.children),
}))

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  __esModule: true,
  oneDark: {},
  oneLight: {},
}))

jest.mock('remark-gfm', () => () => (tree) => tree)