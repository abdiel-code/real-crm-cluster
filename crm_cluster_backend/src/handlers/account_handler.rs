use crate::AppState;
use crate::SocketMessage;
use crate::handlers::auth_handler::Claims;
use crate::models::account::Account;
use axum::{Json, Router, extract::State, http::StatusCode, response::IntoResponse, routing::get};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use validator::Validate;

#[derive(Deserialize, sqlx::FromRow, Serialize, Validate)]
pub struct CreateAccount {
    #[validate(length(min = 1, message = "Name is required"))]
    name: String,
    industry: Option<String>,
}

pub async fn get_accounts_count(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM accounts WHERE user_id = $1")
        .bind(claims.sub)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| {
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                format!("GET_ACCOUNTS_COUNT_ERROR: {}", e),
            )
        })?;

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": count
    })))
}

pub async fn get_accounts(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let accounts: Vec<Account> = sqlx::query_as("SELECT * FROM accounts WHERE user_id = $1")
        .bind(claims.sub)
        .fetch_all(&state.db_pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("GET_ACCOUNTS_ERROR: {}", e),
            )
        })?;

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": accounts
    })))
}

pub async fn get_account_by_id(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(account_id): axum::extract::Path<i32>,
    claims: Claims,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let account: Account = sqlx::query_as("SELECT * FROM accounts WHERE id = $1 AND user_id = $2")
        .bind(account_id)
        .bind(claims.sub)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::NOT_FOUND, format!("ACCOUNT_NOT_FOUND: {}", e)))?;

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": account
    })))
}

pub async fn delete_account_by_id(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(account_id): axum::extract::Path<i32>,
    claims: Claims,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    sqlx::query("DELETE FROM accounts WHERE id = $1 AND user_id = $2")
        .bind(account_id)
        .bind(claims.sub)
        .execute(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::NOT_FOUND, format!("ACCOUNT_NOT_FOUND: {}", e)))?;

    // Send notification with socket
    let _ = state.tx.send(SocketMessage {
        event: "ACCOUNT_DELETED".to_string(),
        payload: serde_json::json!(account_id),
    });

    // Return no content
    Ok(Json(serde_json::json!({
        "message": "ACCOUNT_DELETED_SUCCESSFULLY",
        "payload": "",
    })))
}

pub async fn create_account(
    State(state): State<Arc<AppState>>,
    claims: Claims,
    Json(payload): Json<CreateAccount>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Validate field
    payload
        .validate()
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("VALIDATION_ERROR: {}", e)))?;

    // Send Query
    let account = sqlx::query_as::<_, Account>(
        "INSERT INTO accounts (user_id, name, industry) VALUES ($1, $2, $3) RETURNING *",
    )
    .bind(claims.sub)
    .bind(payload.name)
    .bind(payload.industry)
    .fetch_one(&state.db_pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("CREATE_ACCOUNT_ERROR: {}", e),
        )
    })?;

    // Send notification with socket
    let _ = state.tx.send(SocketMessage {
        event: "ACCOUNT_CREATED".to_string(),
        payload: serde_json::json!(account),
    });

    Ok(Json(serde_json::json!({
        "message": "ACCOUNT_CREATED_SUCCESSFULLY",
        "payload": account
    })))
}

pub async fn update_account(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(account_id): axum::extract::Path<i32>,
    claims: Claims,
    Json(payload): Json<CreateAccount>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Validate field
    payload
        .validate()
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("VALIDATION_ERROR: {}", e)))?;

    // Make Query
    let account = sqlx::query_as::<_, Account>(
        "UPDATE accounts SET name = $1, industry = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
    )
    .bind(payload.name)
    .bind(payload.industry)
    .bind(account_id)
    .bind(claims.sub)
    .fetch_one(&state.db_pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("UPDATE_ACCOUNT_ERROR: {}", e),
        )
    })?;

    // Send notification with socket
    let _ = state.tx.send(SocketMessage {
        event: "ACCOUNT_UPDATED".to_string(),
        payload: serde_json::json!(account),
    });

    Ok(Json(serde_json::json!({
        "message": "ACCOUNT_UPDATED_SUCCESSFULLY",
        "payload": account
    })))
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/count", get(get_accounts_count))
        .route("/", get(get_accounts).post(create_account))
        .route(
            "/{account_id}",
            get(get_account_by_id)
                .delete(delete_account_by_id)
                .put(update_account),
        )
}
