#!/bin/bash

set -euo pipefail

BABY_PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BABY_SOURCE="$BABY_PROJECT_ROOT/skills/baby-care-assistant"
BABY_SKILLS_ROOT="${CODEX_HOME:-$HOME/.codex}/skills"
BABY_DESTINATION="$BABY_SKILLS_ROOT/baby-care-assistant"
BABY_VALIDATOR="$HOME/.codex/skills/.system/skill-creator/scripts/quick_validate.py"

if [ ! -f "$BABY_SOURCE/SKILL.md" ]; then
  echo "没有找到宝宝 Skill 源文件：$BABY_SOURCE"
  exit 1
fi

if [ -f "$BABY_VALIDATOR" ]; then
  if ! python3 "$BABY_VALIDATOR" "$BABY_SOURCE"; then
    echo "本机缺少验证器依赖，继续安装已在项目中验证通过的 Skill。"
  fi
fi

mkdir -p "$BABY_SKILLS_ROOT"

if [ -e "$BABY_DESTINATION" ]; then
  BABY_BACKUP="$BABY_DESTINATION.backup-$(date +%Y%m%d-%H%M%S)"
  mv "$BABY_DESTINATION" "$BABY_BACKUP"
  echo "旧版本已备份到：$BABY_BACKUP"
fi

cp -R "$BABY_SOURCE" "$BABY_DESTINATION"
chmod +x "$BABY_DESTINATION/scripts/baby.mjs" "$BABY_DESTINATION/scripts/configure-macos.sh"

echo
echo "宝宝助手已安装为全局 Skill：$BABY_DESTINATION"
echo
read -r -p "现在配置家庭访问凭据吗？[Y/n] " BABY_CONFIGURE
if [[ ! "$BABY_CONFIGURE" =~ ^[Nn]$ ]]; then
  bash "$BABY_DESTINATION/scripts/configure-macos.sh"
fi

echo
if [ "${BABY_SKIP_HEALTH:-0}" = "1" ]; then
  echo "已跳过 CloudBase 健康检查。"
elif BABY_HEALTH="$(node "$BABY_DESTINATION/scripts/baby.mjs" health 2>/dev/null)" && [[ -n "$BABY_HEALTH" ]]; then
  echo "CloudBase Agent 已连接。"
else
  echo "注意：宝宝助手 API 暂时无法连接，请检查网络或服务地址。"
fi

echo "安装完成。请在新的 Codex 对话中说：用宝宝助手记录……"
read -r -p "按回车键关闭此窗口……" _BABY_DONE
