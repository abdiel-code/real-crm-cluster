// src/main.rs
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::{net::SocketAddr};
use tokio::net::TcpListener;
use axum::{
    routing::get,
    Router,
};
use tokio::sync::broadcast;
use std::sync::Arc;
use dotenvy::dotenv;
use tower_http::cors::{Any, CorsLayer};

// Get all models
mod models;
mod handlers;

// Def Structs
#[derive(Clone, serde::Serialize)]
pub struct SocketMessage {
    pub event: String,
    pub payload: serde_json::Value,
}

// Def shared state
struct AppState {
    db_pool: PgPool,
    tx: broadcast::Sender<SocketMessage>,
}

// Create async main function
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    // Create database pool
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("Failed to create database pool");

    // Create broadcast channel
    let (tx, _rx) = broadcast::channel::<SocketMessage>(16);

    // Create shared state
    let shared_state = Arc::new(AppState {
        db_pool: pool,
        tx,
    });

    // Config CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Config Router
    let app = Router::new()
        .route("/", get(|| async { "Server is runing"}))
        .route("/ws", get(handlers::socket_handler::ws_handler))
        .nest("/accounts", handlers::account_handler::router())
        .nest("/businesses", handlers::business_handler::router())
        .nest("/contacts", handlers::contact_handler::router())
        .nest("/dashboard", handlers::dashboard_handler::router())
        .layer(cors)
        .with_state(shared_state);

    // Config address
    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));

    // Config listener
    let listener = TcpListener::bind(addr).await?;
    println!("Listening on http://{}", addr);

    // Run Server
    axum::serve(listener, app).await?;

    Ok(())
}
