use axum::{extract::State, Json, response::IntoResponse, http::StatusCode, Router, routing::get};
use std::sync::Arc;
use crate::models::account::Account;
use crate::AppState;
use crate::SocketMessage;

#[derive(serde::Deserialize, sqlx::FromRow)]
pub struct CreateAccount {
    name: String,
    industry: Option<String>
}

pub async fn get_accounts_count(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM accounts")
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("GET_ACCOUNTS_COUNT_ERROR: {}", e)))?;
    
    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": count
    })))
}

pub async fn get_accounts(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let accounts: Vec<Account> = sqlx::query_as("SELECT * FROM accounts")
        .fetch_all(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("GET_ACCOUNTS_ERROR: {}", e)))?;
    
    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": accounts
    })))
}

pub async fn get_account_by_id(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(account_id): axum::extract::Path<i32>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let account: Account = sqlx::query_as("SELECT * FROM accounts WHERE id = $1")
        .bind(account_id)
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
) -> Result<impl IntoResponse, (StatusCode, String)> {
    sqlx::query("DELETE FROM accounts WHERE id = $1")
        .bind(account_id)
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
    Json(payload): Json<CreateAccount>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let account = sqlx::query_as::<_, Account>("INSERT INTO accounts (name, industry) VALUES ($1, $2) RETURNING *")
        .bind(payload.name)
        .bind(payload.industry)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("CREATE_ACCOUNT_ERROR: {}", e)))?;

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

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/count", get(get_accounts_count))
        .route("/", get(get_accounts).post(create_account))
        .route("/{account_id}", get(get_account_by_id).delete(delete_account_by_id))
}