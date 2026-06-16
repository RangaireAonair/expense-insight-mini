module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
    ],
    'scope-case': [2, 'always', ['lower-case', 'kebab-case']],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100]
  },
  prompt: {
    useEmoji: false,
    allowCustomIssuePrefix: false,
    allowEmptyIssuePrefix: false,
    confirmColorize: true,
    scopes: [
      'app',
      'home',
      'bill',
      'add',
      'analytics',
      'account',
      'profile',
      'ui',
      'store',
      'build',
      'release',
      'docs'
    ],
    messages: {
      type: '选择提交类型:',
      scope: '选择影响范围，可跳过:',
      customScope: '请输入自定义 scope:',
      subject: '填写简短描述:',
      body: '填写详细描述，可跳过:',
      breaking: '列出破坏性变更，可跳过:',
      footerPrefixesSelect: '选择关联 issue 类型，可跳过:',
      customFooterPrefix: '请输入自定义 issue 前缀:',
      footer: '填写 issue 引用，例如 #123:',
      confirmCommit: '确认使用以上提交信息?'
    },
    types: [
      { value: 'feat', name: 'feat:     新功能' },
      { value: 'fix', name: 'fix:      缺陷修复' },
      { value: 'docs', name: 'docs:     文档变更' },
      { value: 'style', name: 'style:    格式或样式调整，不影响逻辑' },
      { value: 'refactor', name: 'refactor: 重构，不新增功能也不修复缺陷' },
      { value: 'perf', name: 'perf:     性能优化' },
      { value: 'test', name: 'test:     测试相关' },
      { value: 'build', name: 'build:    构建系统或依赖变更' },
      { value: 'ci', name: 'ci:       CI 配置变更' },
      { value: 'chore', name: 'chore:    其他维护性变更' },
      { value: 'revert', name: 'revert:   回滚提交' }
    ],
    issuePrefixes: [{ value: 'closed', name: 'closed: 关闭 issue' }]
  }
}
