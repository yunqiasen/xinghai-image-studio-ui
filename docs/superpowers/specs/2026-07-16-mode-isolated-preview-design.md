# 分类隔离预览与任务状态设计

日期：2026-07-16
仓库：`xinghai-image-studio-ui`

## 目标

让每个创作分类拥有独立的生图预览和任务状态。切换分类只切换当前视图，不取消或覆盖其他分类的任务。每个分类的模型选择统一放在参数区最顶部，当前各分类只展示 `GPT Image 2.0`，后续允许按分类增加不同模型。

## 当前问题

`GenerationProvider` 目前只维护一份 `task`、`busy`、`resultUrls`、`error` 和 `startedAt`。因此文生图与图生图共用同一份任务状态，切换分类后会继续显示上一个分类的预览。

## 方案

在生成状态层按 `StudioMode` 建立任务状态映射。每个分类独立保存：

- 当前任务
- 是否正在创建或执行
- 开始时间
- 结果 URL
- 错误信息
- 当前分类的提示词、素材和模型选择

任务请求写入发起时的 `mode`。后台轮询任务列表时，按任务的 mode 回填对应分类状态。切换分类只改变当前 mode，不执行取消任务或清空其他分类状态。

状态结构保持可扩展，建议形态：

```ts
type StudioGenerationState = {
  task?: ImageTask;
  starting: boolean;
  startedAt?: number;
  resultUrls: string[];
  error?: string;
};

type StudioGenerationStates = Record<StudioMode, StudioGenerationState>;
```

## 交互规则

- 文生图没有任务时显示文生图空预览。
- 图生图没有任务时显示图生图空预览，不继承文生图结果。
- 某分类任务执行中时，该分类显示自己的 loading 状态。
- 切换分类不会取消原分类任务。
- 原分类任务完成后，结果只写入原分类。
- 切回原分类后恢复该分类自己的 loading、成功或失败状态。
- 任务失败只影响所属分类，不覆盖其他分类错误状态。
- 分类提示词、素材和参数继续按分类隔离，不能因切换而互相覆盖。

## 模型配置

在 studio 配置层新增按分类的模型列表：

```ts
const studioModeModels: Record<StudioMode, StudioModelOption[]> = {
  text: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  image: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  edit: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  "remove-bg": [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  upscale: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  batch: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
};
```

每个分类的 model 控件放在该分类参数区最顶部，控件样式沿用文生图当前模型选择器。模型列表只由当前分类配置决定，不从其他分类复用。

## 组件边界

- `GenerationProvider`：维护任务列表轮询和按分类分发，不负责分类 UI。
- `generation-context`：暴露按分类读取状态和启动任务的接口。
- `StudioPage`：读取当前 mode 的任务状态，传给 `StudioPreview`。
- `ModeSettings`：根据当前 mode 渲染该分类自己的模型列表，并保持模型选择位置统一。
- `StudioPreview`：只渲染传入分类的状态，不持有跨分类任务数据。
- `mode-config`：保存分类模型配置和已有分类控制项。

## 任务数据流

```text
提交当前分类任务
  -> 请求中携带当前 mode
  -> 后端返回 task
  -> Provider 按 task.mode 写入对应状态
  -> 轮询任务列表
  -> 按 task.mode 更新对应状态
  -> StudioPage 读取当前 mode
  -> StudioPreview 只显示当前分类预览
```

## 测试设计

实现前先增加失败测试：

1. 分类状态初始化时每个 mode 都有独立空状态。
2. 文生图结果不会出现在图生图状态中。
3. 文生图任务执行中切换到图生图时，文生图仍保持 active。
4. 任务轮询完成后只更新任务所属 mode。
5. 每个分类顶部渲染自己的模型选择器。
6. 当前所有分类的模型列表只包含 `GPT Image 2.0`。
7. 后续可通过配置让不同分类拥有不同模型列表。

## 非目标

- 不修改后端 API 字段和路径。
- 不取消或重启已有任务。
- 不改变图片尺寸、预览适配和 Lightbox 行为。
- 不新增前端伪造的模型接口。
- 不在本次改动中引入模型管理后台。
