use serde::{Serialize, Deserialize};
use sqlx::FromRow;
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Account {
    pub id: i32,
    pub name: String,
    pub industry: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}