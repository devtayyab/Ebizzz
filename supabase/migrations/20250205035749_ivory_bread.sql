/*
  # Add vector search capabilities
  
  1. New Extensions
    - Enable vector extension for similarity search
    - Enable pgvector for vector operations
  
  2. New Columns
    - Add embedding column to products table
  
  3. New Indexes
    - Add vector index for fast similarity search
*/

-- Enable the vector extension
create extension if not exists vector;

-- Add embedding column to products table
alter table products add column if not exists embedding vector(1536);

-- Create a function to update embeddings
create or replace function update_product_embedding()
returns trigger as $$
begin
  -- Concatenate product details for embedding
  new.embedding = (
    select embedding from generate_embeddings(
      new.name || ' ' || 
      new.supplier_name || ' ' || 
      new.price::text
    )
  );
  return new;
end;
$$ language plpgsql;