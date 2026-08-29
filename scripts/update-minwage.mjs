// =============================================================================
//  data.go.kr 「고용노동부_연도별 최저임금」 → minwage.json 자동 갱신
//  - GitHub Action에서 실행됩니다 (Node 20, 내장 fetch 사용, 외부 의존성 0)
//  - 환경변수:
//      MINWAGE_API_URL      : data.go.kr에서 받은 엔드포인트(uddi 포함, serviceKey 제외)
//      MINWAGE_SERVICE_KEY  : 일반 인증키(Decoding)
//  - 실패해도 프로세스를 죽이지 않습니다(exit 0). 사이트는 기존 minwage.json/폴백으로 안전.
// =============================================================================
import { readFileSync, writeFileSync } from "node:fs";

const API_URL = process.env.MINWAGE_API_URL;
const KEY = process.env.MINWAGE_SERVICE_KEY;

if (!API_URL || !KEY) {
  console.error("⚠️  MINWAGE_API_URL / MINWAGE_SERVICE_KEY 가 설정되지 않았습니다. 건너뜁니다.");
  process.exit(0);
}

// odcloud.kr 파일데이터 오픈API 표준 파라미터
const url = new URL(API_URL);
url.searchParams.set("serviceKey", KEY);
url.searchParams.set("page", "1");
url.searchParams.set("perPage", "100");
url.searchParams.set("returnType", "JSON");

let json;
try {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) { console.error("⚠️  API 응답 오류:", res.status, await res.text().catch(() => "")); process.exit(0); }
  json = await res.json();
} catch (e) {
  console.error("⚠️  API 호출 실패:", e.message);
  process.exit(0);
}

// odcloud는 { data: [ {...행...} ] } 형태로 반환
const rows = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
if (!rows.length) { console.error("⚠️  데이터가 비어 있습니다."); process.exit(0); }

// 필드명이 데이터셋마다 다를 수 있어 유연하게 탐색: '연도/년도' 열과 '시간급/시급/시간' 열
function pick(row, keywords) {
  for (const k of Object.keys(row)) {
    if (keywords.some((w) => k.includes(w))) return String(row[k] ?? "");
  }
  return null;
}

const parsed = rows
  .map((r) => {
    const yRaw = pick(r, ["연도", "년도"]);
    const wRaw = pick(r, ["시간급", "시급", "시간"]);
    const y = yRaw ? parseInt(yRaw.replace(/[^0-9]/g, ""), 10) : NaN;
    const w = wRaw ? parseInt(wRaw.replace(/[^0-9]/g, ""), 10) : NaN;
    return { y, w };
  })
  .filter((o) => o.y >= 2000 && o.y < 2100 && o.w > 1000);

if (!parsed.length) {
  console.error("⚠️  연도/시급 파싱 실패. 실제 필드명을 확인하세요:", Object.keys(rows[0]));
  process.exit(0);
}

const current = JSON.parse(readFileSync("minwage.json", "utf8"));
let changed = false;
for (const { y, w } of parsed) {
  if (current[y] !== w) { current[y] = w; changed = true; console.log(`✅ ${y}년 → ${w.toLocaleString()}원`); }
}

if (!changed) { console.log("변경 사항 없음."); process.exit(0); }

// 연도 오름차순 정렬 후 저장
const sorted = Object.fromEntries(
  Object.keys(current).map(Number).sort((a, b) => a - b).map((k) => [k, current[k]])
);
writeFileSync("minwage.json", JSON.stringify(sorted, null, 2) + "\n");
console.log("🎉 minwage.json 갱신 완료.");
