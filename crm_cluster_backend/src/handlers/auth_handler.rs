use crate::AppState;
use crate::models::user::User;
use axum::{
    Json, Router,
    extract::{FromRequestParts, State},
    http::{StatusCode, header, request::Parts},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use bcrypt::{DEFAULT_COST, hash, verify};
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};
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

pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUser>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
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
    .bind(payload.email)
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
        .bind(&payload.email)
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
        .same_site(SameSite::Strict)
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

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/logout", post(logout))
}
