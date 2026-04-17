use crate::AppState;
use crate::models::user::User;
use axum::{Json, Router, extract::State, http::StatusCode, response::IntoResponse, routing::get};
use std::sync::Arc;

pub async fn get_users(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let users: Vec<User> = sqlx::query_as("SELECT * FROM users")
        .fetch_all(&state.db_pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("GET_USERS_ERROR: {}", e),
            )
        })?;

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": users
    })))
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", get(get_users))
}
