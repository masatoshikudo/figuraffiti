/**
 * APIエラーレスポンスの型定義
 */
export interface ApiErrorResponse {
  error: string
  details?: string
  code?: string
  hint?: string
}

/**
 * APIエラーデータの型定義
 */
export interface ApiErrorData {
  error?: string
  details?: string
  code?: string
  hint?: string
  message?: string
}

/**
 * APIエラーレスポンスを解析
 */
export function parseApiError(response: Response, data: ApiErrorData): ApiErrorResponse {
  const errorMessage = data.details || data.error || `Failed to fetch: ${response.status}`
  const errorCode = data.code
  const errorHint = data.hint

  return {
    error: errorMessage,
    details: errorMessage,
    code: errorCode,
    hint: errorHint,
  }
}

/**
 * APIエラーログを出力（開発環境用）
 */
export function logApiError(
  context: string,
  error: ApiErrorResponse | ApiErrorData,
  response?: Response
): void {
  // ApiErrorResponseまたはApiErrorDataのどちらでも受け入れる
  const errorMessage = error.error || error.message || "Unknown error"
  const errorCode = error.code
  const errorHint = error.hint
  const errorDetails = error.details

  console.error(`${context} error:`, {
    message: errorMessage,
    code: errorCode,
    hint: errorHint,
    details: errorDetails,
    status: response?.status,
    fullError: error, // デバッグ用に完全なエラーオブジェクトも出力
  })

  if (process.env.NODE_ENV === "development") {
    console.error(`詳細エラー情報:
メッセージ: ${errorMessage}
${errorCode ? `コード: ${errorCode}` : ""}
${errorHint ? `ヒント: ${errorHint}` : ""}
${errorDetails ? `詳細: ${errorDetails}` : ""}
${response ? `ステータス: ${response.status}` : ""}`)
  }
}

/**
 * APIリクエストのエラーハンドリング
 */
export async function handleApiResponse<T>(
  response: Response,
  context: string = "API"
): Promise<T> {
  let data: any = {}
  
  try {
    const contentType = response.headers.get("content-type")
    const responseText = await response.text()
    
    // レスポンスが空の場合
    if (!responseText || responseText.trim() === "") {
      console.error(`${context} - Empty response:`, {
        status: response.status,
        statusText: response.statusText,
        contentType,
      })
      if (!response.ok) {
        throw new Error(`Empty response: ${response.status} ${response.statusText}`)
      }
      // 空のレスポンスでもOKの場合は空配列を返す
      return [] as T
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error(`${context} - JSON parse error:`, {
          status: response.status,
          statusText: response.statusText,
          contentType,
          responseText: responseText.substring(0, 500), // 最初の500文字のみ
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
        })
        throw new Error(`Failed to parse JSON: ${response.status} ${response.statusText}`)
      }
    } else {
      // JSON以外のレスポンス（HTMLエラーページなど）の場合
      console.error(`${context} - Non-JSON response:`, {
        status: response.status,
        statusText: response.statusText,
        contentType,
        text: responseText.substring(0, 200), // 最初の200文字のみ
      })
      throw new Error(`Invalid response format: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    // 既にエラーがスローされている場合はそのまま再スロー
    if (error instanceof Error && error.message.includes("Failed to parse") || error.message.includes("Invalid response") || error.message.includes("Empty response")) {
      throw error
    }
    // その他のエラー
    console.error(`${context} - Unexpected error:`, {
      status: response.status,
      statusText: response.statusText,
      error: error instanceof Error ? error.message : String(error),
    })
    throw new Error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
  }

  if (!response.ok) {
    const apiError = parseApiError(response, data || {})
    logApiError(context, apiError, response)
    throw new Error(apiError.error)
  }

  // エラーレスポンスの場合は空配列を設定
  if (data && typeof data === "object" && "error" in data) {
    const apiError = parseApiError(response, data)
    logApiError(context, apiError, response)
    throw new Error(apiError.error)
  }

  return data as T
}

