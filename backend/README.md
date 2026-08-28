# MIA - Backend

This is the official backend for the MIA project. It contains the REST API, the blockchain event indexer, and USDC payment services.

## Tech Stack
- **Node.js** (Express.js)
- **PostgreSQL** (Main database)
- **Redis** (Cache & queues)
- **ethers.js** (Blockchain connection)
- **Docker** (Containerization)

## How to run locally

1. **Start the databases:**
   ```bash
   docker-compose up -d
