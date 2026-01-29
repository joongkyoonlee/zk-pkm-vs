# Notion OAuth 통합 가이드

## 📋 설정된 구성

### Notion OAuth 자격증명
- **Client ID**: `2f5d872b-594c-80a7-a4c9-0037e4f518a7`
- **Client Secret**: `secret_jOtZezwtNCADHbdTgP7LICr16DWjhEER7ZWSdjrFUh`
- **Redirect URI**: `https://delerzsuniomqzlykedd.supabase.co/functions/v1/notion-callback`
- **OAuth 서버**: `https://api.notion.com/v1/oauth/authorize`

## 🔧 환경 설정

### .env.local 파일 (이미 구성됨)
```env
VITE_NOTION_CLIENT_ID=2f5d872b-594c-80a7-a4c9-0037e4f518a7
VITE_NOTION_CLIENT_SECRET=secret_jOtZezwtNCADHbdTgP7LICr16DWjhEER7ZWSdjrFUh
VITE_NOTION_REDIRECT_URI=https://delerzsuniomqzlykedd.supabase.co/functions/v1/notion-callback
VITE_NOTION_AUTH_URL=https://api.notion.com/v1/oauth/authorize

VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
VITE_OPENAI_API_KEY=your-openai-key
```

## 🚀 기능 구현 현황

### ✅ 완료된 항목

1. **Notion OAuth 연결 플로우**
   - Settings 페이지에서 "Notion 계정 연결" 버튼
   - OAuth 인증 URL 생성 및 리다이렉션
   - 콜백 페이지 (`/notion-callback`) 구현

2. **토큰 저장 및 관리**
   - Supabase Auth 사용자 메타데이터에 Notion 토큰 저장
   - 토큰 보안: 클라이언트 측에서는 노출 안 됨
   - 연결 상태 관리

3. **Notion 동기화 (Supabase Edge Function)**
   - Notion API 통합: 페이지 검색 및 콘텐츠 추출
   - 자동 마이그레이션: `notion_page_id` 필드 추가
   - 중복 방지: 기존 페이지 감지 및 업데이트

4. **UI/UX**
   - Settings에서 연결 상태 표시
   - Home 페이지에서 Notion 연동 상태 경고
   - 동기화 상태 표시 (idle → syncing → done/error)

### 📊 데이터베이스 구조

#### notes 테이블 (업데이트됨)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- title: TEXT
- content: TEXT
- source: TEXT (user|notion|ai)
- notion_page_id: TEXT (새로 추가)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 마이그레이션 파일
- `001_initial_schema.sql`: 초기 스키마
- `002_add_notion_page_id.sql`: Notion 페이지 ID 필드 추가

## 🔄 사용 흐름

### 1. 사용자 로그인
- Supabase Auth (이메일/비밀번호 또는 OAuth)

### 2. Settings에서 Notion 연결
```
Settings → "Notion 계정 연결" → Notion OAuth → 권한 부여 → /notion-callback
```

### 3. 노트 동기화
```
Home → "동기화" → sync-notion Edge Function 호출 → Notion 페이지 가져오기 → DB 저장
```

### 4. 콘텐츠 확인
- Recent Notes: 동기화된 Notion 페이지 표시
- 소스별 구분: `source` 필드로 구별 (user|notion|ai)

## 🛠️ 개발자 명령어

### 로컬 개발
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### Supabase 마이그레이션 적용 (필수)
```bash
supabase db push
```

### Edge Function 배포
```bash
supabase functions deploy sync-notion
```

## 🔐 보안 고려사항

1. **CORS**: Edge Function은 `*` 오리진 허용 (프로덕션에서는 제한 필요)
2. **토큰 저장**: Supabase Auth 메타데이터 (안전)
3. **API 시크릿**: 환경 변수로 관리
4. **RLS 정책**: 각 테이블에 Row-Level Security 적용

## 🚨 다음 단계

1. [ ] Supabase 프로젝트 생성 및 URL/KEY 설정
2. [ ] 데이터베이스 마이그레이션 적용 (`supabase db push`)
3. [ ] Edge Function 배포 (`supabase functions deploy sync-notion`)
4. [ ] https://cdsa.kr에 배포
5. [ ] Notion 권한 테스트
6. [ ] 임베딩/검색 기능 구현
7. [ ] AI 제안 피드 구현

## 📚 참고 자료

- [Notion OAuth 문서](https://developers.notion.com/docs/guides/authorize-the-user)
- [Notion API 참고서](https://developers.notion.com/reference/intro)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## 🎯 현재 상태

✅ **OAuth 통합 완료**
- 클라이언트 ID, 시크릿, 리다이렉트 URI 반영됨
- 설정 페이지에서 Notion 연결 가능
- 콜백 처리 구현됨

⏳ **다음 우선순위**
1. 프로덕션 배포 (cdsa.kr)
2. 임베딩 파이프라인
3. 의미론적 검색
4. 지식 그래프 시각화
