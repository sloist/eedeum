# 이전 배경색 백업 (2026-03-31)

되돌리려면 :root의 배경 변수를 아래로 교체하세요.

```css
/* 따뜻한 베이지 (원래 값) */
:root {
  --bg:#F5F0E8;
  --bgW:#EDE7DC;
  --bgC:#FDFAF5;
  --bgD:#E8E1D5;
  --bd:#DDD4C8;
  --bdL:#EDE7DC;
}

body { background: var(--bgD); }

/* 헤더 */
.hd { background: rgba(245,240,232,.88); }

/* 하단네비 */
.bnav { background: rgba(245,240,232,.9); }

/* 피드 책 클러스터 */
.fbc { background: rgba(245,240,232,0.4); }
.fbc:hover { background: rgba(245,240,232,0.55); }
```
