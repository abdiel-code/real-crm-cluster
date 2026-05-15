use crate::AppState;
use crate::models::user::User;
use axum::{
    Json, Router,
    extract::{FromRequestParts, State},
    http::{StatusCode, header, request::Parts},
    response::IntoResponse,
    routing::post,
};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use bcrypt::{DEFAULT_COST, hash, verify};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use std::sync::Arc;

// Extractor

impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // 1. Extract cookies from request

        let jar = CookieJar::from_headers(&parts.headers);

        // 2. Get the token cookie
        let token = jar
            .get("token")
            .map(|c| c.value().to_string())
            .ok_or((StatusCode::UNAUTHORIZED, "MISSING_TOKEN".to_string()))?;

        // 3. Decode and validate JWT
        let secret = std::env::var("JWT_SECRET")
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "ENV_ERROR".to_string()))?;

        let token_data = decode::<Claims>(
            &token,
            &DecodingKey::from_secret(secret.as_bytes()),
            &Validation::default(),
        )
        .map_err(|_| (StatusCode::UNAUTHORIZED, "INVALID_TOKEN".to_string()))?;
        Ok(token_data.claims)
    }
}

#[derive(serde::Deserialize, sqlx::FromRow)]
pub struct CreateUser {
    name: String,
    email: String,
    password: String,
}

#[derive(serde::Deserialize, sqlx::FromRow, serde::Serialize)]
pub struct UserResponse {
    id: i32,
    name: String,
    email: String,
    created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(serde::Deserialize)]
pub struct LoginUser {
    email: String,
    password: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Claims {
    pub sub: i32,
    pub email: String,
    pub exp: usize,
}

#[derive(serde::Deserialize)]
pub struct ForgotPasswordRequest {
    email: String,
}

#[derive(serde::Deserialize)]
pub struct ResetPasswordRequest {
    token: String,
    new_password: String,
}

pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUser>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    // Validate name:
    if payload.name.len() < 8 {
        return Err((StatusCode::BAD_REQUEST, "INVALID_NAME".to_string()));
    };

    // Validate email:
    if !payload.email.contains("@") || !payload.email.contains(".") {
        return Err((StatusCode::BAD_REQUEST, "INVALID_EMAIL".to_string()));
    };

    // Validate password
    if payload.password.len() < 8 {
        return Err((StatusCode::BAD_REQUEST, "INVALID_PASSWORD".to_string()));
    };

    // Validate existing mail
    let existing = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users WHERE email = $1")
        .bind(&payload.email.to_lowercase())
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("DB_ERROR: {}", e),
            )
        })?;

    if existing > 0 {
        return Err((StatusCode::CONFLICT, "EMAIL_ALREAY_EXISTS".to_string()));
    };

    // Hash password
    let hashed_password = hash(payload.password, DEFAULT_COST).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("PASSWORD_ERROR: {}", e),
        )
    })?;

    // Create User

    let user = sqlx::query_as::<_, UserResponse>("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at")
    .bind(payload.name)
    .bind(payload.email.to_lowercase())
    .bind(hashed_password)
    .fetch_one(&state.db_pool)
    .await
    .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("CREATE_USER_ERROR: {}", e),
            )
        })?;

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at
        }
    })))
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginUser>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Find User
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&payload.email.to_lowercase())
        .fetch_one(&state.db_pool)
        .await
        .map_err(|_| (StatusCode::UNAUTHORIZED, "INVALID_CREDENTIALS".to_string()))?;

    // Check for valid password
    let valid = verify(&payload.password, &user.password_hash).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("VERIFY_ERROR: {}", e),
        )
    })?;

    if !valid {
        return Err((StatusCode::UNAUTHORIZED, "INVALID_CREDENTIALS".to_string()));
    }

    // Create Token

    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::days(7))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user.id,
        email: user.email.clone(),
        exp: expiration,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("TOKEN_ERROR: {}", e),
        )
    })?;

    let cookie = Cookie::build(("token", token))
        .http_only(true)
        .same_site(SameSite::None)
        .secure(true)
        .path("/")
        .max_age(time::Duration::days(7))
        .build();

    Ok((
        StatusCode::OK,
        [(header::SET_COOKIE, cookie.to_string())],
        Json(serde_json::json!({"message": "LOGIN_SUCCESS"})),
    ))
}

pub async fn logout() -> impl IntoResponse {
    let cookie = Cookie::build(("token", ""))
        .http_only(true)
        .same_site(SameSite::Strict)
        .path("/")
        .max_age(time::Duration::seconds(0))
        .build();

    (
        StatusCode::OK,
        [(header::SET_COOKIE, cookie.to_string())],
        Json(serde_json::json!({"message": "LOGOUT_SUCCESS"})),
    )
}

pub async fn forgot_password(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ForgotPasswordRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&payload.email.to_lowercase())
        .fetch_optional(&state.db_pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("DB_ERROR: {}", e),
            )
        })?;

    if user.is_none() {
        return Ok(Json(serde_json::json!({"message": "RESET_EMAIL_SENT"})));
    }

    let user = user.unwrap();

    let token = uuid::Uuid::new_v4().to_string();
    let expires_at = chrono::Utc::now() + chrono::Duration::minutes(15);

    sqlx::query("UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3")
        .bind(&token)
        .bind(expires_at)
        .bind(user.id)
        .execute(&state.db_pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("DB_ERROR: {}", e),
            )
        })?;

    let resend_api_key = std::env::var("RESEND_API_KEY")
        .map_err(|_e| (StatusCode::INTERNAL_SERVER_ERROR, "ENV_ERROR".to_string()))?;

    let reset_link = format!("https://app.foxcoon.online/reset-password?token={}", token);

    let client = reqwest::Client::new();
    client
        .post("https://api.resend.com/emails")
        .header("Authorization", format!("Bearer {}", resend_api_key))
        .json(&serde_json::json!({
            "from": "noreplay@foxcoon.online",
            "to": user.email,
            "subject": "Password Recovery",
            "html": format!(
                "<p>Haz clic en el siguiente enlace para recuperar tu contraseña. Expira en 15 minutos.</p><a href=\"{}\">Recuperar contraseña</a>",
                reset_link
            )
        }))
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("EMAIL_ERROR: {}", e)))?;

    Ok(Json(serde_json::json!({"message": "RESET_EMAIL_SENT"})))
}

pub async fn reset_password(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ResetPasswordRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE reset_token = $1")
        .bind(&payload.token)
        .fetch_optional(&state.db_pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("DB_ERROR: {}", e),
            )
        })?
        .ok_or((StatusCode::BAD_REQUEST, "INVALID_TOKEN".to_string()))?;

    let expires_at = user
        .reset_token_expires_at
        .ok_or((StatusCode::BAD_REQUEST, "INVALID_TOKEN".to_string()))?;

    if chrono::Utc::now() > expires_at {
        return Err((StatusCode::BAD_REQUEST, "TOKEN_EXPIRED".to_string()));
    }

    if payload.new_password.len() < 8 {
        return Err((StatusCode::BAD_REQUEST, "INVALID_PASSWORD".to_string()));
    }

    let hashed = hash(&payload.new_password, DEFAULT_COST).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("PASSWORD_ERROR: {}", e),
        )
    })?;

    sqlx::query(
        "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2"
    )
    .bind(&hashed)
    .bind(user.id)
    .execute(&state.db_pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB_ERROR: {}", e)))?;

    Ok(Json(
        serde_json::json!({"message": "PASSWORD_RESET_SUCCESS"}),
    ))
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/logout", post(logout))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
}
