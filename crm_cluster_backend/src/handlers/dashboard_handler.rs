use axum::{extract::State, response::IntoResponse, http::StatusCode, Json, Router, routing::get};
use std::sync::Arc;
use crate::AppState;

#[derive(serde::Serialize)]
struct MetricData {
    total: i64,
    history: Vec<i64>,
}

#[derive(serde::Serialize)]
struct DashboardPayload {
    accounts: MetricData,
    contacts: MetricData,
    business: MetricData,
}

async fn get_last_days_data(
    table: &str,
    state: &Arc<AppState>,
    days: i64,
) -> Result<Vec<i64>, (StatusCode, String)> {
   let table_name = match table {
       "accounts" => "accounts",
       "contacts" => "contacts",
       "business" => "business",
       _ => return Err((StatusCode::BAD_REQUEST, "Invalid table name".to_string())),
   };

   let query = format!(
    r#"
       SELECT COALESCE(count(t.id), 0) as count
       FROM generate_series(now() - (interval '1 day' * $1), now(), '1 day') AS day
       LEFT JOIN {} t ON date_trunc('day', t.created_at) = date_trunc('day', day)
       GROUP BY day
       ORDER BY day ASC
       "#,
    table_name
   );      

   let counts: Vec<i64> = sqlx::query_scalar(&query)
       .bind(days)
       .fetch_all(&state.db_pool)
       .await
       .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DASHBOARD_{}_HISTORY_ERROR: {}", table.to_uppercase(), e)))?;

   Ok(counts)
}

pub async fn get_dashboard_metrics(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let accounts_history = get_last_days_data("accounts", &state, 6).await?;
    let contacts_history = get_last_days_data("contacts", &state, 6).await?;
    let business_history = get_last_days_data("business", &state, 6).await?;

    let payload = DashboardPayload {
        accounts: MetricData {
            total: accounts_history.iter().sum(),
            history: accounts_history.clone(),
        },
        contacts: MetricData {
            total: contacts_history.iter().sum(),
            history: contacts_history.clone(),
        },
        business: MetricData {
            total: business_history.iter().sum(),
            history: business_history.clone(),
        },
    };

    Ok(Json(serde_json::json!({
        "status": "success",
        "payload": payload,
    })))
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/summary", get(get_dashboard_metrics))
}