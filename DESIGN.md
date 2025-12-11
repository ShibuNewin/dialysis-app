# System Design Document

## 1. Architecture
Client-Server architecture using React (Frontend) and Node.js/Express (Backend) with a PostgreSQL database.

## 2. Concurrency Control
To prevent overbooking, we use Pessimistic Locking (`SELECT ... FOR UPDATE`) in PostgreSQL. This locks the specific bed row during a booking transaction, ensuring only one user can book it at a time.

## 3. Database Schema
* **Users:** Stores patient details.
* **Slots:** Represents bookable units (linked to Machines and Shifts).
* **Machines:** Represents physical beds (Standard vs Premium).
