import { createClient } from "@supabase/supabase-js";
import path from "path";

// Load env from root
import dotenv from "./backend/node_modules/dotenv/lib/main.js";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
    console.log("Fetching one car to inspect columns...");
    const { data, error } = await supabase
        .from("cars")
        .select("*")
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No cars found. Cannot inspect columns via row fetch.");
        return;
    }

    const columns = Object.keys(data[0]);
    console.log("Columns found:", columns);

    const cityColumns = columns.filter(col =>
        col.endsWith("_price") &&
        col !== "price_min" &&
        col !== "price_max" &&
        col !== "ex_showroom_price" &&
        col !== "on_road_price"
    );

    console.log("Potential city columns:", cityColumns);

    const formattedCities = cityColumns.map(col => {
        const name = col.replace("_price", "");
        return name.charAt(0).toUpperCase() + name.slice(1);
    });

    console.log("Formatted cities:", formattedCities);
}

inspectColumns();
