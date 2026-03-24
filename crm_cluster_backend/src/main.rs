// src/main.rs
use axum::{Router, routing::get};
use dotenvy::dotenv;
use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};

// Get all models
mod handlers;
mod models;

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
    jwt_secret: String,
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

    // Create jwt state
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    // Create shared state
    let shared_state = Arc::new(AppState {
        db_pool: pool,
        tx,
        jwt_secret,
    });

    // Config CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Config Router
    let app = Router::new()
        .route("/", get(|| async { "Server is runing" }))
        .route("/ws", get(handlers::socket_handler::ws_handler))
        .nest("/accounts", handlers::account_handler::router())
        .nest("/businesses", handlers::business_handler::router())
        .nest("/contacts", handlers::contact_handler::router())
        .nest("/dashboard", handlers::dashboard_handler::router())
        .nest("/users", handlers::user_handler::router())
        .nest("/auth", handlers::auth_handler::router())
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
