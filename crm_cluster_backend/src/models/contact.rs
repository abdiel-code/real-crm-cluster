use serde::{Serialize, Deserialize};
use sqlx::FromRow;
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Contact {
    pub id: i32,
    pub account_id: Option<i32>,
    first_name: String,
    last_name: Option<String>,
    email: String,
    phone: Option<String>,
    created_at: Option<chrono::DateTime<chrono::Utc>>,
}