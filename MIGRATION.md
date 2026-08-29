# 커스텀 도메인 전환 가이드

새 도메인을 사면 이 문서 순서대로 하면 됩니다. 소스 수정은 `migrate-domain.sh` 한 번이면 끝나고, 나머지는 클릭 작업이에요. **클로드 프로의 클로드 코드로도 충분히 가능**합니다. (급하면 이 문서 보고 직접 해도 돼요.)

현재 주소: `https://ilopark.github.io/juhyu-site/`
바꿀 주소 예: `https://juhyu-calc.com/` (실제 산 도메인으로)

---

## 1단계 · 도메인 구매

가비아, 후이즈, Cloudflare, Namecheap 등 아무 데서나 사면 됩니다. `.com` 기준 보통 연 1~2만원.

## 2단계 · 소스 교체 (자동)

레포 폴더에서 Git Bash 열고 한 줄 실행:

```bash
bash migrate-domain.sh juhyu-calc.com
```

→ 모든 `canonical` / `og:url` / `og:image` / `twitter:image` / `robots.txt` / `sitemap.xml` 의 주소가 새 도메인으로 바뀌고, `CNAME` 파일이 생깁니다.
(상대경로 링크와 GA4는 도메인과 무관해서 안 건드립니다.)

> **또는 클로드 코드에게**: "migrate-domain.sh 로 도메인 juhyu-calc.com 으로 교체하고 커밋·푸시해줘" 한마디면 됩니다.

교체 후 커밋·푸시:

```bash
git add -A && git commit -m "chore: 커스텀 도메인 전환" && git push
```

## 3단계 · 도메인 DNS 설정

도메인 산 곳의 DNS 관리에서 아래를 추가합니다.

**루트 도메인용 A 레코드 4개** (GitHub Pages 고정 IP):

```
A   @   185.199.108.153
A   @   185.199.109.153
A   @   185.199.110.153
A   @   185.199.111.153
```

**www 서브도메인용 CNAME** (선택이지만 권장):

```
CNAME   www   ilopark.github.io.
```

> DNS 반영에 최대 몇 시간 걸릴 수 있어요.

## 4단계 · GitHub Pages 커스텀 도메인 연결

- 레포 → **Settings → Pages → Custom domain** 에 `juhyu-calc.com` 입력 후 Save
  (2단계에서 CNAME 파일을 이미 푸시했으면 자동으로 채워져 있을 수 있어요)
- **Enforce HTTPS** 체크 (인증서 발급에 몇 분~몇 시간)

## 5단계 · Search Console 새 도메인 등록

⚠️ 기존 github.io 색인은 새 도메인으로 자동으로 안 넘어옵니다. 새로 등록해야 해요.

- Search Console → 속성 추가 → **도메인** 또는 **URL 접두어**(`https://juhyu-calc.com/`)
- 소유확인 (도메인 방식이면 DNS TXT, URL 방식이면 HTML 파일/메타 — 클로드 코드로 파일 추가 가능)
- **Sitemaps** 메뉴에 `sitemap.xml` 제출
- **URL 검사**로 홈 + 가이드 4편 색인 요청

## 6단계 · 색인 대기 (2~4주)

새 도메인이 구글에 자리 잡을 시간을 줍니다. **이 기간에 애드센스 신청하지 말 것.** (당일 신청은 거절 확률 ↑)

## 7단계 · 애드센스 신청

- [adsense.google.com](https://adsense.google.com) 에서 사이트 `juhyu-calc.com` 등록
- 승인 심사 중/후에 **ads.txt** 를 루트에 둡니다. 애드센스가 준 pub 번호(`pub-XXXXXXXXXXXXXXXX`)로:

```bash
bash migrate-domain.sh juhyu-calc.com pub-XXXXXXXXXXXXXXXX
git add -A && git commit -m "chore: ads.txt 추가" && git push
```

→ `ads.txt` 내용은 이렇게 생성돼요:
```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

- 승인되면 광고 단위 코드를 페이지에 삽입 (클로드 코드에게 "계산 결과 아래에 애드센스 광고 넣어줘" 요청)

---

## 요약 체크리스트

- [ ] 도메인 구매
- [ ] `bash migrate-domain.sh 새도메인.com` → 커밋·푸시
- [ ] DNS A 레코드 4개 + www CNAME
- [ ] GitHub Pages 커스텀 도메인 + Enforce HTTPS
- [ ] Search Console 새 도메인 등록 + sitemap + 색인 요청
- [ ] 2~4주 색인 대기
- [ ] 애드센스 신청 + ads.txt (pub 번호)
- [ ] 승인 후 광고 코드 삽입
