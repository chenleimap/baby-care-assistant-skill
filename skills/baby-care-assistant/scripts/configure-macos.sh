#!/bin/bash

set -euo pipefail

if [ "$(uname -s)" != "Darwin" ]; then
  echo "此配置脚本仅支持 macOS。其他系统请设置 BABY_API_BASE、BABY_FAMILY_CODE 和 BABY_CAREGIVER_NAME。"
  exit 1
fi

BABY_KEYCHAIN_ACCOUNT="${USER:-baby-care}"

read -r -p "宝宝助手 API 地址：" BABY_API_BASE
read -r -p "照护者称呼（爸爸、妈妈或家人称呼）[爸爸]：" BABY_CAREGIVER
BABY_CAREGIVER="${BABY_CAREGIVER:-爸爸}"
read -r -s -p "家庭访问码（输入时不会显示）：" BABY_CODE
echo

if [ -z "$BABY_API_BASE" ]; then
  echo "未输入 API 地址，配置已取消。"
  exit 1
fi

if [ -z "$BABY_CODE" ]; then
  echo "未输入访问码，配置已取消。"
  exit 1
fi

/usr/bin/security add-generic-password -U -a "$BABY_KEYCHAIN_ACCOUNT" -s "baby-care-assistant-api-base" -w "$BABY_API_BASE" >/dev/null
/usr/bin/security add-generic-password -U -a "$BABY_KEYCHAIN_ACCOUNT" -s "baby-care-assistant-family-code" -w "$BABY_CODE" >/dev/null
/usr/bin/security add-generic-password -U -a "$BABY_KEYCHAIN_ACCOUNT" -s "baby-care-assistant-caregiver-name" -w "$BABY_CAREGIVER" >/dev/null

unset BABY_CODE
echo "宝宝助手凭据已安全保存到 macOS 钥匙串。"
