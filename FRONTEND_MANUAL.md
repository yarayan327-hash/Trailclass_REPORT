Trailclass Report System - 前端维护手册 (Front-End Manual)
版本: v1.0 更新日期: 2026-01-03 核心描述: 本文档详细记录了 Trailclass 试听课报告系统的前端架构、页面逻辑、参数传递方式及常见问题排查方案。

1. 项目架构概览 (Architecture)
本项目基于 Next.js 14 (App Router) 构建，使用 TypeScript 和 Tailwind CSS。

核心目录结构
Plaintext

app/
├── actions/                  # Server Actions (前端调用的后端接口)
│   └── teacher.ts            # 处理评价提交逻辑
├── teacher/
│   └── evaluate/
│       └── [materialId]/     # 路由: /teacher/evaluate/unit-1
│           └── page.tsx      # 【页面A】老师评价表单页
├── report/
│   └── [reportId]/           # 路由: /report/report-123
│       └── page.tsx          # 【页面B】学生报告展示页 (长图、雷达图)
└── layout.tsx                # 全局布局 (字体、Metadata)
2. 核心页面逻辑详解
页面 A: 老师评价页 (Teacher Evaluate)
文件路径: app/teacher/evaluate/[materialId]/page.tsx

功能: 老师对学生进行 5 维评分，并提交生成报告。

关键逻辑流：
参数获取:

materialId: 从路由参数 params 获取 (如 unit-1)。

studentName: 从 URL 参数 ?name=... 获取 (默认为 "Student")。

teacherId: 目前从 LocalStorage 或 State 获取 (默认为 "Ms. Hala")。

提交处理 (handleSubmit):

调用 Server Action (submitAssessment) 将数据传给后端。

跳转逻辑 (CRITICAL): 拿到后端返回的 reportId 后，前端负责构建跳转 URL。

跳转公式:

JavaScript

/report/${reportId}?name=${学生名}&teacher=${老师名}
注意: 如果报告页显示名字不对，请第一时间检查这里的 URL 拼接逻辑。

页面 B: 报告展示页 (Report Display)
文件路径: app/report/[reportId]/page.tsx

功能: 展示给家长看的精美报告（支持英语/阿语切换）。

数据加载机制 (Mock + URL Override)：
目前采用 “基础模版 + URL 参数覆盖” 的策略：

BASE_MOCK_DATA: 代码中写死了一份默认数据（包含课程名、词汇、句型等静态内容）。

动态覆盖:

studentName: 读取 URL ?name=... 参数覆盖模版。

instructor: 读取 URL ?teacher=... 参数覆盖模版。

avatar: 使用 dicebear API，根据 teacher 名字自动生成对应头像。

关键组件：
RadarChart: 自定义 SVG 组件，根据 data.scores 绘制雷达图。

WindingPathBg: SVG 背景组件，绘制蜿蜒的成长路径。

多语言 (TRANSLATIONS): 字典对象，控制 en (英语) 和 ar (阿拉伯语/RTL布局) 的文案切换。

3. 数据流向图 (Data Flow)
在排查数据不显示问题时，请参照此流程：

代码段

[浏览器: 评价页]
   |
   +--- (用户输入分数)
   |
   v
[Server Action: submitAssessment] <--- (后端逻辑)
   |
   +--- (返回 { success: true, id: 'xxx' })
   |
   v
[浏览器: 评价页]
   |
   +--- (前端路由跳转: router.push)
   |    URL: /report/xxx?name=Yara&teacher=Hala
   v
[浏览器: 报告页]
   |
   +--- (读取 URL Params: name, teacher)
   +--- (读取 Local/DB Data: 词汇, 句型)
   |
   v
[渲染最终页面]
4. 故障排查指南 (Troubleshooting)
如果在后续开发或演示中遇到问题，请查阅以下方案：

Q1: 报告页显示的名字是 "Student" 或 "Ms. Hala"，不是我填写的？
原因: URL 参数传递丢失。

检查: 观察浏览器地址栏，URL 结尾是否有 ?name=XXX&teacher=YYY。

修复: 检查 app/teacher/evaluate/[materialId]/page.tsx 中的 handleSubmit 函数，确保 router.push 中的字符串拼接正确。

Q2: 页面出现 404 Not Found？
原因: 文件夹结构错误或路由参数未匹配。

检查:

确保文件夹名为 [reportId] (带方括号)。

确保文件名为 page.tsx。

重启开发服务器 (npm run dev) 以重建路由缓存。

Q3: 阿拉伯语下排版混乱？
原因: RTL (Right-to-Left) 样式未生效。

修复:

检查最外层 div 是否包含 dir={isRtl ? "rtl" : "ltr"}。

检查具体元素的 class 是否使用了逻辑属性 (如 ms-2 代替 ml-2) 或根据 isRtl 变量动态切换 class。

Q4: 样式看起来不对 (没有变成长图/卡片样式错误)？
原因: 代码被旧版本覆盖或 Tailwind 类名冲突。

修复: 确认 app/report/[reportId]/page.tsx 的代码是V3 长图版本（包含 WindingPathBg 组件的版本），而不是 V1 的卡片版本。

Q5: 报错 "Syntax Error: Expected '>', got 'className'"？
原因: 把 JSX (HTML) 代码贴到了 .ts (后端逻辑) 文件里。

修复: 界面代码只能放在 page.tsx，后端逻辑 (actions/*.ts) 只能写纯函数。

5. 后续开发注意事项 (TODO)
当前前端处于 "半动态" 状态。在接入真实后端数据库后，需要修改以下文件：

修改报告页 (report/.../page.tsx):

移除 BASE_MOCK_DATA。

改为在 useEffect 或服务端组件中，使用 prisma.report.findUnique 通过 reportId 直接查询数据库，获取真实的分数、词汇和评语。

修改评价页 (teacher/.../page.tsx):

teacherId 目前是写死的，后续需改为从登录态获取。