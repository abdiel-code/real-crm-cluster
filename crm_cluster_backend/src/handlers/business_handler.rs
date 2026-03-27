use crate::AppState;
use crate::SocketMessage;
use crate::handlers::auth_handler::Claims;
use crate::models::business::Business;
use axum::{Json, Router, extract::State, http::StatusCode, response::IntoResponse, routing::get};
use serde::{Deserialize, Serialize};
use sqlx::Type;
use sqlx::types::BigDecimal;
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize, Type, Clone, Copy)]
#[sqlx(type_name = "stage")]
#[serde(rename_all = "snake_case")]
pub enum Stage {
    Prospect,
    Lead,
    Proposal,
    Negotiation,
    Won,
    Lost,
    Closed,
    Cancelled,
}

#[derive(serde::Deserialize, sqlx::FromRow)]
pub struct CreateBusiness {
    pub contact_id: Option<i32>,
    pub title: String,
    pub amount: BigDecimal,
    pub stage: Stage,
}

pub async fn count_businesses(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM businesses WHERE user_id = $1")
        .bind(claims.sub)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("COUNT_BUSINESSES_ERROR: {}", e),
            )
        })?;

    Ok(Json(
        serde_json::json!({"message": "SUCCESS", "payload": count}),
    ))
}

pub async fn get_businesses(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let businesses: Vec<Business> = sqlx::query_as("SELECT * FROM businesses WHERE user_id = $1")
        .bind(claims.sub)
        .fetch_all(&state.db_pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("GET_BUSINESSES_ERROR: {}", e),
            )
        })?;

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": businesses
    })))
}

pub async fn create_business(
    State(state): State<Arc<AppState>>,
    claims: Claims,
    Json(payload): Json<CreateBusiness>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let business = sqlx::query_as::<_, Business>("INSERT INTO businesses (user_id, contact_id, title, amount, stage) VALUES ($1, $2, $3, $4, $5) RETURNING *")
        .bind(claims.sub)
        .bind(payload.contact_id)
        .bind(payload.title)
        .bind(payload.amount)
        .bind(payload.stage)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("CREATE_BUSINESS_ERROR: {}", e)))?;

    // Send notification with socket
    let _ = state.tx.send(SocketMessage {
        event: "BUSINESS_CREATED".to_string(),
        payload: serde_json::json!(business),
    });

    Ok(Json(serde_json::json!({
        "message": "BUSINESS_CREATED_SUCCESSFULLY",
        "payload": business
    })))
}

pub async fn get_business_by_id(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(business_id): axum::extract::Path<i32>,
    claims: Claims,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let business: Business =
        sqlx::query_as("SELECT * FROM businesses WHERE id = $1 AND user_id = $2")
            .bind(business_id)
            .bind(claims.sub)
            .fetch_one(&state.db_pool)
            .await
            .map_err(|e| (StatusCode::NOT_FOUND, format!("BUSINESS_NOT_FOUND: {}", e)))?;

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": business
    })))
}

pub async fn delete_business_by_id(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(business_id): axum::extract::Path<i32>,
    claims: Claims,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    sqlx::query("DELETE FROM businesses WHERE id = $1 AND user_id = $2")
        .bind(business_id)
        .bind(claims.sub)
        .execute(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::NOT_FOUND, format!("BUSINESS_NOT_FOUND: {}", e)))?;

    // Send notification with socket
    let _ = state.tx.send(SocketMessage {
        event: "BUSINESS_DELETED".to_string(),
        payload: serde_json::json!(business_id),
    });

    // Return no content
    Ok(Json(serde_json::json!({
        "message": "BUSINESS_DELETED_SUCCESSFULLY",
        "payload": "",
    })))
}

pub async fn update_business_by_id(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(business_id): axum::extract::Path<i32>,
    claims: Claims,
    Json(payload): Json<CreateBusiness>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let business = sqlx::query_as::<_, Business>("UPDATE businesses SET contact_id = $1, title = $2, amount = $3, stage = $4 WHERE id = $5 AND user_id = $6 RETURNING *")
        .bind(payload.contact_id)
        .bind(payload.title)
        .bind(payload.amount)
        .bind(payload.stage)
        .bind(business_id)
        .bind(claims.sub)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("UPDATE_BUSINESS_ERROR: {}", e)))?;

    // Send notification with socket
    let _ = state.tx.send(SocketMessage {
        event: "BUSINESS_UPDATED".to_string(),
        payload: serde_json::json!(business),
    });

    Ok(Json(serde_json::json!({
        "message": "BUSINESS_UPDATED_SUCCESSFULLY",
        "payload": business
    })))
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/count", get(count_businesses))
        .route("/", get(get_businesses).post(create_business))
        .route(
            "/{business_id}",
            get(get_business_by_id)
                .delete(delete_business_by_id)
                .put(update_business_by_id),
        )
}
