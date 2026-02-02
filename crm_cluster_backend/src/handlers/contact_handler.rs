use axum::{extract::State, Json, response::IntoResponse, http::StatusCode, Router, routing::get};
use serde::{Deserialize};
use std::sync::Arc;
use crate::models::contact::Contact;
use crate::AppState;
use crate::SocketMessage;

#[derive(Deserialize, sqlx::FromRow)]
pub struct CreateContact {
    pub account_id: Option<i32>,
    pub first_name: String,
    pub last_name: Option<String>,
    pub email: String,
    pub phone: Option<String>,
}

pub async fn count_contacts(
    State(state): State<Arc<AppState> >
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM contacts")
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("COUNT_CONTACTS_ERROR: {}", e)))?;

    Ok(Json(serde_json::json!({"message": "SUCCESS", "payload": count})))    
}

pub async fn get_contacts(
    State(state): State<Arc<AppState> >
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let contacts: Vec<Contact> = sqlx::query_as("SELECT * FROM contacts")
        .fetch_all(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("GET_CONTACTS_ERROR: {}", e)))?;

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": contacts
    })))
}

pub async fn get_contact_by_id(
    State(state): State<Arc<AppState> >,
    axum::extract::Path(contact_id): axum::extract::Path<i32>
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let contact: Contact = sqlx::query_as("SELECT * FROM contacts WHERE id = $1")
        .bind(contact_id)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::NOT_FOUND, format!("CONTACT_NOT_FOUND: {}", e)))?;

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": contact
    })))
}

pub async fn create_contact(
    State(state): State<Arc<AppState> >,
    Json(payload): Json<CreateContact>
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let contact = sqlx::query_as::<_, Contact>("INSERT INTO contacts (account_id, first_name, last_name, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *")
        .bind(payload.account_id)
        .bind(payload.first_name)
        .bind(payload.last_name)
        .bind(payload.email)
        .bind(payload.phone)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("CREATE_CONTACT_ERROR: {}", e)))?;

    // Send notification with socket
    let _ = state.tx.send(SocketMessage {
        event: "CONTACT_CREATED".to_string(),
        payload: serde_json::json!(contact),
    });

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": contact
    })))
}

pub async fn delete_contact_by_id(
    State(state): State<Arc<AppState> >,
    axum::extract::Path(contact_id): axum::extract::Path<i32>
) -> Result<impl IntoResponse, (StatusCode, String)> {
    sqlx::query("DELETE FROM contacts WHERE id = $1")
        .bind(contact_id)
        .execute(&state.db_pool) 
        .await
        .map_err(|e| (StatusCode::NOT_FOUND, format!("CONTACT_NOT_FOUND: {}", e)))?;

    // Send notification with socket
    let _ = state.tx.send(SocketMessage {
        event: "CONTACT_DELETED".to_string(),
        payload: serde_json::json!(contact_id),
    });

    // Return no content
    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": ""
    })))
}

pub async fn update_contact_by_id(
    State(state): State<Arc<AppState> >,
    axum::extract::Path(contact_id): axum::extract::Path<i32>,
    Json(payload): Json<CreateContact>
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let contact = sqlx::query_as::<_, Contact>("UPDATE contacts SET account_id = $1, first_name = $2, last_name = $3, email = $4, phone = $5 WHERE id = $6 RETURNING *")
        .bind(payload.account_id)
        .bind(payload.first_name)
        .bind(payload.last_name)
        .bind(payload.email)
        .bind(payload.phone)
        .bind(contact_id)
        .fetch_one(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("UPDATE_CONTACT_ERROR: {}", e)))?;

    // Send notification with socket
    let _ = state.tx.send(SocketMessage {
        event: "CONTACT_UPDATED".to_string(),
        payload: serde_json::json!(contact),
    });

    Ok(Json(serde_json::json!({
        "message": "SUCCESS",
        "payload": contact
    })))
}

pub fn router () -> Router<Arc<AppState>> {
    Router::new()
        .route("/count", get(count_contacts))
        .route("/", get(get_contacts).post(create_contact))
        .route("/{contact_id}", get(get_contact_by_id).delete(delete_contact_by_id).put(update_contact_by_id))
}
