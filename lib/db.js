// lib/db.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing in environment variables.");
  }

  export const healthCheck = async () => {
    const { error } = await supabase.from("heads").select("id").limit(1);
    if (error) {
      throw new Error("Database connection failed.");
    }
    return true;
  };
  