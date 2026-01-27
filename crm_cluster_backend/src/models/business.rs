use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use sqlx::types::BigDecimal;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Business {
    pub id: i32,
    pub contact_id: Option<i32>,
    pub title: String,
    pub amount: BigDecimal,
    pub stage: String,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}