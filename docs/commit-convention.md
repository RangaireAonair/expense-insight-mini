# Commit Message Convention

本项目使用 Angular 风格的 Conventional Commits，并通过 `commitlint` 在 `commit-msg` 阶段校验。

推荐使用 `cz-git` 交互式提交向导生成提交信息：

```powershell
git add .
npm run commit
```

命令执行后会依次提示选择提交类型、影响范围、简短描述、详细说明、破坏性变更和关联 issue。

## 格式

```text
<type>(<scope>): <subject>
```

`scope` 可选，但推荐填写。

## 类型

- `feat`: 新功能
- `fix`: 缺陷修复
- `docs`: 文档变更
- `style`: 格式或样式调整，不影响逻辑
- `refactor`: 重构，不新增功能也不修复缺陷
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或依赖变更
- `ci`: CI 配置变更
- `chore`: 其他维护性变更
- `revert`: 回滚提交

## 示例

```text
feat(bill): add monthly bill filters
fix(add): prevent invalid amount submission
docs(readme): update development guide
build(release): configure changelog generation
```

## 破坏性变更

```text
feat(api)!: change record storage schema

BREAKING CHANGE: records now require accountId.
```

## 版本与 CHANGELOG

根据提交记录生成版本和 `CHANGELOG.md`：
根据提交记录生成版本、`CHANGELOG.md`、release commit 和 tag，并直接推送到远端：

```powershell
npm run release        # 自动推断 patch/minor/major，并 push commit/tag
npm run release:patch  # 指定 patch，并 push commit/tag
npm run release:minor  # 指定 minor，并 push commit/tag
npm run release:major  # 指定 major，并 push commit/tag
```

release 提交信息为：

```text
chore(release): vX.Y.Z
```
