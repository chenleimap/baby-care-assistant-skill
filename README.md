# 宝宝助手 Skill

一个面向家庭照护记录的 Codex Skill。可以用自然语言记录、查询、更正和撤销宝宝的喂养、睡眠、尿布、情绪与体温记录；支持混合喂养，母乳按分钟、奶粉按毫升记录。

## 安装

### macOS

1. 点击 GitHub 页面右上角的 **Code → Download ZIP** 并解压。
2. 双击 `安装宝宝Skill.command`。
3. 按提示填写照护者称呼和家庭访问码。
4. 重新打开一个 Codex 对话，说“用宝宝助手记录：母乳左侧 15 分钟，奶粉 60 毫升”。

### 手动安装

把 `skills/baby-care-assistant` 复制到：

```text
~/.codex/skills/baby-care-assistant
```

macOS 可运行下面的配置脚本，把访问凭据安全保存到系统钥匙串：

```bash
bash ~/.codex/skills/baby-care-assistant/scripts/configure-macos.sh
```

其他系统可设置环境变量：

```bash
export BABY_API_BASE="https://你的宝宝助手-api.example.com/api"
export BABY_FAMILY_CODE="你的家庭访问码"
export BABY_CAREGIVER_NAME="爸爸"
```

## 使用示例

- “用宝宝助手记录：母乳右侧 12 分钟，奶粉 70 毫升。”
- “宝宝今天一共喝了多少奶？”
- “把刚才的奶粉改成 80 毫升。”
- “撤销我上一条记录。”

也可以显式调用 `$baby-care-assistant`。

## 隐私与权限

- 仓库不包含家庭访问码、宝宝资料或照护数据。
- 访问码通过环境变量或 macOS 钥匙串提供，不应写入 Skill 或聊天内容。
- 数据、身份和权限由连接的宝宝助手 API 管理。
- 健康记录仅用于家庭观察，不替代专业医疗建议。

## 运行要求

- Codex 桌面端或其他支持本地 Skill 的 Agent
- Node.js 18 或更高版本
- 可访问的宝宝助手 Agent API 和有效家庭访问码
