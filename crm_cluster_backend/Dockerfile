FROM rust:1.92.0 AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/crm_cluster_backend .
EXPOSE 4000
CMD ["./crm_cluster_backend"]