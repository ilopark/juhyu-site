#!/usr/bin/env bash
# =============================================================================
#  도메인 교체 스크립트 — 새 도메인을 사면 이 스크립트 한 번으로 소스 전체를 교체.
#
#  사용법 (Git Bash 에서):
#     bash migrate-domain.sh <새도메인> [애드센스pub번호]
#
#  예:
#     bash migrate-domain.sh juhyu-calc.com
#     bash migrate-domain.sh juhyu-calc.com pub-1234567890123456
#
#  하는 일:
#   1) 모든 html/xml/txt 안의 옛 주소(ilopark.github.io/juhyu-site) → 새 도메인
#   2) CNAME 파일 생성 (GitHub Pages 커스텀 도메인 연결용)
#   3) pub 번호를 주면 ads.txt 생성
#  (상대경로 링크·GA4는 도메인과 무관하므로 손대지 않습니다)
# =============================================================================
set -e

NEW="$1"
PUB="$2"
OLD="ilopark.github.io/juhyu-site"

if [ -z "$NEW" ]; then
  echo "사용법: bash migrate-domain.sh 새도메인.com [pub-XXXXXXXXXXXXXXXX]"
  exit 1
fi

# http/https 접두어 떼서 도메인만 남기기 (실수 방지)
NEW="${NEW#http://}"; NEW="${NEW#https://}"; NEW="${NEW%/}"

echo "▶ '$OLD' → '$NEW' 로 교체합니다..."

# 1) 소스 내 절대 주소 교체
FILES=$(grep -rl --include="*.html" --include="*.xml" --include="*.txt" "$OLD" . || true)
if [ -n "$FILES" ]; then
  echo "$FILES" | xargs sed -i "s#https://$OLD#https://$NEW#g"
  echo "  ✓ 교체된 파일:"
  echo "$FILES" | sed 's/^/     /'
else
  echo "  (교체할 옛 주소가 없습니다 — 이미 교체됐을 수 있어요)"
fi

# 2) CNAME
echo "$NEW" > CNAME
echo "  ✓ CNAME 생성: $NEW"

# 3) ads.txt (pub 번호가 있을 때만)
if [ -n "$PUB" ]; then
  echo "google.com, $PUB, DIRECT, f08c47fec0942fa0" > ads.txt
  echo "  ✓ ads.txt 생성: $PUB"
else
  echo "  · ads.txt 는 건너뜀 (애드센스 pub 번호를 두 번째 인자로 주면 생성)"
fi

echo ""
echo "▶ 소스 교체 끝. 새 주소 확인:"
grep -rho "https://$NEW[^\"< ]*" --include="*.html" . | sort -u | head -6 | sed 's/^/   /'

cat <<'NEXT'

────────────────────────────────────────────────────────
남은 수동 작업 (MIGRATION.md 참고):
  1. 커밋 & 푸시:   git add -A && git commit -m "chore: 커스텀 도메인 전환" && git push
  2. 도메인 DNS 설정 (A레코드 4개 + www CNAME)
  3. GitHub → Settings → Pages → Custom domain 확인 + Enforce HTTPS
  4. Search Console 에 새 도메인 속성 추가 → sitemap 제출 → 색인 요청
  5. 2~4주 색인 후 애드센스 신청
────────────────────────────────────────────────────────
NEXT
