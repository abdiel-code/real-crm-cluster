use serde::{Deserialize, Serialize};
use sqlx::FromRow;
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Account {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub industry: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}
