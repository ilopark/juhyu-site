# 주휴수당 · 퇴직금 계산기

시급·근무시간이나 입·퇴사일만 넣으면 **주휴수당**과 **퇴직금**을 명세서 형태로 바로 계산해 주는 단일 페이지 도구입니다. 외부 라이브러리 0, 순수 HTML/CSS/JS.

- **현재 연도 자동 표시** (`new Date()`)
- **최저시급 완전 자동 갱신** — GitHub Action이 매년 data.go.kr 공식 API로 `minwage.json`을 업데이트
- **폴백 안전장치** — API/JSON을 못 읽어도 코드에 하드코딩된 최신 확정값으로 안전하게 동작

---

## 📁 파일 구조

```
.
├─ index.html                     # 사이트 본체 (SEO <head> + 구조화 데이터 포함)
├─ minwage.json                   # 연도별 최저시급 (Action이 자동 갱신)
├─ sitemap.xml                    # 검색엔진 색인용
├─ robots.txt
├─ scripts/
│   └─ update-minwage.mjs         # data.go.kr API → minwage.json 갱신 스크립트
└─ .github/workflows/
    └─ update-minwage.yml         # 매월 자동 실행 워크플로
```

---

## 🚀 1. GitHub Pages 배포

1. 새 저장소(repo)를 만들고 이 폴더 전체를 push 합니다.
   ```bash
   git init
   git add .
   git commit -m "init: 주휴수당·퇴직금 계산기"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
2. 저장소 **Settings → Pages** → *Source* = **Deploy from a branch**, *Branch* = **main / (root)** → Save.
3. 1~2분 뒤 `https://USERNAME.github.io/REPO/` 에서 접속됩니다.

### ⚠️ 배포 후 URL 치환 (SEO 필수)
아래 파일들에서 `USERNAME`, `REPO`를 실제 값으로 바꾸세요:
- `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image` (총 4곳)
- `robots.txt` — `Sitemap:` 줄
- `sitemap.xml` — `<loc>`

> 사용자명 자체를 저장소 이름(`USERNAME.github.io`)으로 만들면 주소가 `https://USERNAME.github.io/` 로 짧아지고 `/REPO` 가 빠집니다.

---

## 🤖 2. 최저시급 자동 갱신 세팅 (Tier 3)

### (1) data.go.kr API 신청
1. [공공데이터포털](https://www.data.go.kr) 회원가입 후 로그인
2. **「고용노동부_연도별 최저임금」** 검색 (데이터 번호 `15068774`)
3. **오픈API → 활용신청** (자동 승인, 즉시 사용 가능)
4. **마이페이지 → 오픈API → 인증키/엔드포인트** 에서 두 가지를 확보:
   - **엔드포인트 URL** (예: `https://api.odcloud.kr/api/15068774/v1/uddi:xxxxxxxx...`) — `serviceKey`는 빼고 복사
   - **일반 인증키 (Decoding)**

### (2) GitHub에 등록
저장소 **Settings → Secrets and variables → Actions**:
- **Variables** 탭 → `New variable`
  - Name: `MINWAGE_API_URL` / Value: 위 엔드포인트 URL
- **Secrets** 탭 → `New secret`
  - Name: `MINWAGE_SERVICE_KEY` / Value: 일반 인증키(Decoding)

### (3) 동작 확인
- **Actions** 탭 → **Update minimum wage** → **Run workflow** 로 수동 실행
- 로그에 `변경 없음` 또는 `minwage.json 갱신 완료` 가 뜨면 정상
- 이후 매월 1일 자동 실행되어, 새 연도 최저임금이 공표되면 `minwage.json`이 자동 커밋되고 사이트에 반영됩니다.

> API 미설정·오류 시에도 스크립트는 사이트를 망가뜨리지 않습니다(폴백 유지). 자동화가 실패해도 `minwage.json`을 직접 수정해 커밋하면 즉시 반영됩니다.

---

## 🔍 3. 검색 노출 (선택)

- **Google Search Console** 에 사이트 등록 → `sitemap.xml` 제출 → URL 색인 요청
- **네이버 서치어드바이저** 에 별도 등록 (네이버는 구글과 별개)
- Google **리치 결과 테스트** 로 FAQ 구조화 데이터 인식 확인

---

## 🛠 로컬 실행

```bash
python -m http.server 8000
# http://localhost:8000 접속
```
