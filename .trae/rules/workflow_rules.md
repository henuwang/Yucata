# 工作流程规则

## Issue 管理规则

1. **开发前**：在 `ISSUES.md` 中将对应 Issue 状态标记为 `修改中`
2. **开发中**：确保所有代码改动无 TypeScript 错误
3. **开发完成**：在 `ISSUES.md` 中将对应 Issue 状态标记为 `✅ 已完成 (v0.x)`
4. **提 PR**：
   - 创建新分支：`feat/<issue编号>-<简短描述>`
   - **一条 PR 只对应一个 Issue**，禁止多个 Issue 合并在同一个 PR 中
   - 提交代码
   - 推送到远程
   - 创建 Pull Request，PR 描述中使用 `Closes #<issue编号>` 关联对应 Issue
5. **合并后**：更新路线图标记阶段完成
