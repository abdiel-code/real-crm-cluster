use serde::{Deserialize, Serialize};
use sqlx::FromRow;
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Contact {
    pub id: i32,
    pub account_id: Option<i32>,
    pub user_id: i32,
    pub first_name: String,
    pub last_name: Option<String>,
    pub email: String,
    pub phone: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}
