// src/main.rs
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::{fmt::format, net::SocketAddr};
use tokio::net::TcpListener;
use axum::{
    routing::get,
    Router,
    extract::State as AxumState,
};
use std::sync::Arc;
use dotenvy::dotenv;

// Get all models
mod models;

// Def shared state
struct AppState {
    db_pool: PgPool,
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

    // Create shared state
    let shared_state = Arc::new(AppState {db_pool: pool});

    // Config Router
    let app = Router::new()
        .route("/", get(|| async { "Server is runing"}))
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
