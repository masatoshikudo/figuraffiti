// アプリケーション全体で使用する定数

// Mapbox設定
export const MAPBOX_CONFIG = {
  DEFAULT_CENTER: [139.7, 35.68] as [number, number], // 東京
  DEFAULT_ZOOM: 5,
  DETAIL_ZOOM: 14,
  STYLE: "mapbox://styles/mapbox/light-v11",
  FLY_TO_DURATION: 1000,
  CLUSTER_MAX_ZOOM: 14,
  CLUSTER_RADIUS: 50,
  // クラスタクリック時のズーム設定
  CLUSTER_ZOOM_STEP: 2, // 1回のクリックでズームインするステップ数
  CLUSTER_ZOOM_LEVELS: {
    SMALL: 14, // 小さいクラスタ（10件未満）の目標ズームレベル
    MEDIUM: 12, // 中程度のクラスタ（10-50件）の中間ズームレベル
    LARGE: 10, // 大きいクラスタ（50件以上）の中間ズームレベル
  },
  // 個別スポット表示時のズーム設定
  SPOT_DETAIL_ZOOM: 18, // 個別スポット詳細表示時のズームレベル
  CLUSTER_COLORS: {
    SMALL: "#3b82f6", // 10未満: 青
    MEDIUM: "#10b981", // 10-50: 緑
    LARGE: "#f59e0b", // 50-100: オレンジ
    XLARGE: "#ef4444", // 100以上: 赤
  },
  CLUSTER_SIZES: {
    MIN: 20,
    SMALL: 30, // 10以上
    MEDIUM: 40, // 50以上
    LARGE: 50, // 100以上
  },
} as const

// ソースカラー（メディアソース別のピン色）
export const SOURCE_COLORS = {
  Instagram: "#e4405f",
  YouTube: "#ff0000",
  TikTok: "#000000",
  Twitter: "#1da1f2",
  X: "#000000",
  Threads: "#000000",
  Other: "#6b7280",
  default: "#6b7280",
} as const

// API設定
export const API_CONFIG = {
  SPOTS_ENDPOINT: "/api/spots",
  SPOTS_PENDING_ENDPOINT: "/api/spots/pending",
  SPOTS_APPROVE_ENDPOINT: "/api/spots/approve",
  SPOTS_REJECT_ENDPOINT: "/api/spots/reject",
  SPOTS_MY_SUBMISSIONS_ENDPOINT: "/api/spots/my-submissions",
  CO_CREATE_ENDPOINT: "/api/co-create",
  CO_CREATE_PENDING_ENDPOINT: "/api/co-create/pending",
  CO_CREATE_APPROVE_ENDPOINT: "/api/co-create/approve",
  CO_CREATE_REJECT_ENDPOINT: "/api/co-create/reject",
  CO_CREATE_MY_SUBMISSIONS_ENDPOINT: "/api/co-create/my-submissions",
  DISCOVERIES_ENDPOINT: "/api/discoveries",
  TICKER_ENDPOINT: "/api/ticker",
  EXPLORATIONS_ENDPOINT: "/api/explorations",
  PLACES_AUTOCOMPLETE_ENDPOINT: "/api/places/autocomplete",
  PLACES_DETAILS_ENDPOINT: "/api/places/details",
  ADMIN_TRUSTED_USERS_ENDPOINT: "/api/admin/trusted-users",
  PROFILE_CHECK_ADMIN_ENDPOINT: "/api/profile/check-admin",
} as const

// エラーメッセージ
export const ERROR_MESSAGES = {
  // 一般エラー
  FETCH_SPOTS_FAILED: "スポットの取得に失敗しました",
  INVALID_DATA_FORMAT: "予期しないデータ形式です",
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  INTERNAL_SERVER_ERROR: "Internal server error",
  
  // 認証エラー
  AUTH_REQUIRED: "認証が必要です",
  ADMIN_REQUIRED: "管理者権限が必要です",
  USER_NOT_AUTHENTICATED: "User not authenticated",
  SERVER_CONFIG_ERROR: "Server configuration error",
  SUPABASE_NOT_CONFIGURED: "Supabase environment variables are not configured",
  FAILED_INIT_DB: "Failed to initialize database connection",
  
  // スポット関連エラー
  FETCH_PENDING_SPOTS_FAILED: "承認待ちの取得に失敗しました",
  FETCH_SUBMISSIONS_FAILED: "投稿の取得に失敗しました",
  SUBMIT_FAILED: "発見記録の送信に失敗しました",
  APPROVE_FAILED: "承認に失敗しました",
  REJECT_FAILED: "却下に失敗しました",
  SPOT_NOT_FOUND: "スポットが見つかりませんでした",
  
  // バリデーションエラー
  LOCATION_REQUIRED: "地図で場所を選択してください",
  TRICK_NAME_REQUIRED: "作品名・キャラ名を入力してください",
  MEDIA_URL_REQUIRED: "メディアURLを入力してください",
  REJECTION_REASON_REQUIRED: "却下理由を入力してください",
  LOGIN_REQUIRED_FOR_SUBMIT: "発見記録を行うにはログインが必要です",
  
  // ユーザー管理エラー
  FETCH_TRUSTED_USERS_FAILED: "信頼ユーザーの取得に失敗しました",
  ADD_TRUSTED_USER_FAILED: "信頼ユーザーの追加に失敗しました",
  DELETE_TRUSTED_USER_FAILED: "信頼ユーザーの削除に失敗しました",
  TRUSTED_USER_NOT_FOUND: "Trusted user not found",
  USER_ALREADY_TRUSTED: "User is already a trusted user",
  TRUSTED_USER_DELETED: "Trusted user deleted successfully",
  
  // RLSエラー
  RLS_POLICY_ERROR: "RLSポリシーエラー: {message}. マイグレーションが正しく実行されているか確認してください。",
} as const

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  SPOT_SUBMITTED: "発見記録を送信しました",
  SPOT_SUBMITTED_DESCRIPTION: "記録が反映されました",
  CO_CREATE_SUBMITTED: "共創申請を送信しました",
  CO_CREATE_SUBMITTED_DESCRIPTION: "審査キューに追加しました",
  SPOT_APPROVED: "承認しました",
  SPOT_APPROVED_DESCRIPTION: "記録内容がマップに反映されました",
  SPOT_REJECTED: "却下しました",
  SPOT_REJECTED_DESCRIPTION: "記録内容を却下しました",
  TRUSTED_USER_ADDED: "信頼ユーザーを追加しました",
  TRUSTED_USER_DELETED: "信頼ユーザーを削除しました",
} as const

// UIテキスト
export const UI_TEXT = {
  // 共通
  LOADING: "読み込み中...",
  SUBMITTING: "送信中...",
  ERROR: "エラー",
  SUCCESS: "成功",
  CANCEL: "キャンセル",
  SUBMIT: "送信",
  APPROVE: "承認",
  REJECT: "却下",
  DELETE: "削除",
  CLOSE: "閉じる",
  SAVE: "保存",
  EDIT: "編集",
  
  // フォーム
  SELECT_LOCATION: "場所を選択",
  TRICK_NAME: "作品名・キャラ名",
  MEDIA_URL: "SNSリンク",
  REJECTION_REASON: "却下理由",
  SUBMIT_RECORD: "発見記録を送信",
  SUBMIT_CO_CREATE: "共創申請を送信",
  RECORD_FORM: "発見記録フォーム",
  CO_CREATE_FORM: "共創申請フォーム",
  MINIMAL_INFO_DESCRIPTION: "この場所で AhhHum の痕跡を見つけた記録を送信します",
  CO_CREATE_DESCRIPTION: "設置意図、場所、参考リンクを添えて共創申請を送信します",
  
  // プレースホルダー
  TRICK_NAME_PLACEHOLDER: "例: キャラ名、作品名",
  MEDIA_URL_PLACEHOLDER: "Instagram, TikTok, YouTube などのURL",
  REJECTION_REASON_PLACEHOLDER: "例: 不適切な内容が含まれています",
  
  // ヘルプテキスト（削除）
  LOCATION_HELP: "",
  TRICK_NAME_HELP: "",
  MEDIA_URL_HELP: "",
  
  // ページタイトル
  SUBMIT_PAGE_TITLE: "発見記録をする",
  SUBMIT_PAGE_DESCRIPTION: "この場所で見つけた痕跡を記録します",
  APPLY_PAGE_TITLE: "設置申請をする",
  APPLY_PAGE_DESCRIPTION: "街に新しい痕跡を置くための共創申請を送信します",
  
  // 管理画面
  ADMIN_PAGE_TITLE: "承認管理",
  PENDING_SPOTS_TITLE: "承認待ちの記録",
  NO_PENDING_SPOTS: "承認待ちはありません",
  ADMIN_REQUIRED_MESSAGE: "管理者権限が必要です",
  ADMIN_ADD_INSTRUCTIONS: "管理者を追加する方法:",
  ADMIN_ADD_STEP1: "Supabaseのダッシュボードにアクセス",
  ADMIN_ADD_STEP2: "SQL Editorを開く",
  ADMIN_ADD_STEP3: "以下のSQLを実行（ユーザーIDを実際の値に置き換えてください）:",
  ADMIN_ADD_SQL_EXAMPLE: "INSERT INTO admin_users (user_id, created_by, note)\nVALUES ('あなたのユーザーID', 'あなたのユーザーID', '初期管理者');",
  
  // プロフィール
  PROFILE_PAGE_TITLE: "プロフィール",
  MY_SUBMISSIONS: "マイ投稿",
  SETTINGS: "設定",
  
  // ステータスバッジ
  STATUS_PENDING: "承認待ち",
  STATUS_APPROVED: "承認済み",
  STATUS_REJECTED: "却下済み",
} as const

// タイムアウト・遅延設定
export const TIMING_CONFIG = {
  // アニメーション・遅延
  FORM_OPEN_DELAY: 100, // フォームを開くまでの遅延（ms）
  MAP_INIT_RETRY_DELAY: 200, // 地図初期化のリトライ間隔（ms）
  SPOT_UPDATE_DEBOUNCE: 200, // スポット更新のデバウンス（ms）
  MEDIA_LOAD_CHECK_INTERVAL: 200, // メディア読み込みチェック間隔（ms）
  MEDIA_LOAD_TIMEOUT: 1000, // メディア読み込みタイムアウト（ms）
  POPUP_DELAY: 300, // ポップアップ表示遅延（ms）
  
  // リトライ設定
  MAP_INIT_MAX_RETRIES: 10, // 地図初期化の最大リトライ回数
  
  // クラスタリング
  CLUSTER_CLICK_ZOOM_DURATION: 500, // クラスタクリック時のズーム時間（ms）
} as const

// ステータス値
export const SPOT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

// メディアタイプ
export const MEDIA_TYPE = {
  VIDEO: "video",
  COVER: "cover",
} as const

// メディアソース
export const MEDIA_SOURCE = {
  INSTAGRAM: "Instagram",
  YOUTUBE: "YouTube",
  X: "X",
  THREADS: "Threads",
  TIKTOK: "TikTok",
  OTHER: "Other",
} as const

// メディアURL判定パターン
export const MEDIA_URL_PATTERNS = {
  INSTAGRAM: ["instagram.com"],
  YOUTUBE: ["youtube.com", "youtu.be"],
  X: ["twitter.com", "x.com"],
  THREADS: ["threads.net"],
  TIKTOK: ["tiktok.com"],
} as const

// 外部URL
export const EXTERNAL_URLS = {
  MAPBOX: "https://www.mapbox.com/",
  MAPBOX_API_GEOCODING: "https://api.mapbox.com/geocoding/v5/mapbox.places",
  GOOGLE_STREETVIEW: "https://maps.googleapis.com/maps/api/streetview",
  INSTAGRAM_MEDIA: "https://www.instagram.com/p",
  THREADS: "", // コミュニティ用。必要に応じて設定
  /** お問い合わせ（Google フォーム） */
  CONTACT_FORM: "https://forms.gle/9BctdNRMvT8kA1MD8",
} as const

// スポットマージ設定
export const SPOT_MERGE_CONFIG = {
  // 同じスポットとみなす距離の閾値（度単位）
  // 50m ≈ 0.0005度（緯度の場合、経度は緯度によって変わるが、簡易的に同じ値を使用）
  DISTANCE_THRESHOLD: 0.0005, // 約50m
} as const

// ホットスポット設定
export const HOTSPOT_CONFIG = {
  RADIUS_METERS: 25, // クラスタリングの半径（メートル）
  MIN_COUNT: 5, // ホットスポットとして表示する最小記録数
  DAYS_AGO: 7, // 何日前までの記録を対象にするか
  INTENSITY_THRESHOLDS: {
    HIGH: 10, // 10件以上でhigh
    MEDIUM: 7, // 7件以上でmedium
    LOW: 5, // 5件以上でlow
  },
} as const

// クラスタリング設定
export const CLUSTER_CONFIG = {
  RADIUS_METERS: 50, // クラスタリングの半径（メートル）
} as const

// ユーザープロフィール用（スキルレベルは本アプリでは未使用・API互換のため残す）
export const USER_SKILL_LEVELS = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 1,
} as const

// ステータス別ピンデザイン設定（承認済み・承認待ちのみ）
export const SPOT_MARKER_STYLES = {
  approved: {
    color: "#10b981", // 緑
    shape: "circle",
    size: 24,
    border: "2px solid white",
    animation: null,
  },
  pending: {
    color: "#6b7280", // グレー
    shape: "circle",
    size: 24,
    border: "2px dashed #6b7280",
    animation: null,
  },
} as const

// AhhHum Phase1: 曖昧サークル
export const AHHHUM_CONFIG = {
  CIRCLE_RADIUS_M: 150,
  ADMIN_CIRCLE_DELAY_HOURS: 1,
  SPOT_EXPIRATION_DAYS: 180,
  CIRCLE_SWITCH_ZOOM: 13,
  PIN_CLICK_ZOOM: 14,
  EXPLORATION_DURATION_MINUTES: 30,
  FRESHNESS_HOURS_HIGH: 48, // 48h以内 = 高鮮度（赤系）
  FRESHNESS_DAYS_MEDIUM: 7, // 7日以内 = 中鮮度（黄系）
  // 7日超 = 低鮮度（グレー系）
  CIRCLE_COLORS: {
    HIGH: "#dc2626", // 赤系
    MEDIUM: "#eab308", // 黄系
    LOW: "#6b7280", // グレー
  },
} as const

// レスポンシブ設定
export const RESPONSIVE_CONFIG = {
  MOBILE_BREAKPOINT: 768, // モバイル/デスクトップの境界（px）
  DESKTOP_PADDING_RIGHT: 0.25, // デスクトップでの右側パディング（画面幅の25%）
  DESKTOP_PADDING_BOTTOM: 0.4, // デスクトップでの下部パディング（画面高さの40%）
} as const

// HTTPステータスコード
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const
