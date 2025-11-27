
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
    console.log("Checking car status distribution...");

    const { data, error } = await supabase
        .from("cars")
        .select("id, brand, model, status");

    if (error) {
        console.error("Error fetching cars:", error);
        return;
    }

    console.log(`Total cars found: ${data.length}`);

    const statusCounts = {};
    const nonActiveCars = [];

    data.forEach(car => {
        const status = car.status;
        // Count occurrences
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        // Identify non-active cars (strict check)
        if (status !== 'active') {
            nonActiveCars.push({
                id: car.id,
                brand: car.brand,
                model: car.model,
                status: status, // Show exact value including quotes if needed
                statusLength: status ? status.length : 0
            });
        }
    });

    console.log("\n--- Status Distribution ---");
    console.table(statusCounts);

    if (nonActiveCars.length > 0) {
        console.log(`\n--- Found ${nonActiveCars.length} cars that are NOT strictly 'active' ---`);
        console.log("Details of first 20 non-active cars:");
        console.table(nonActiveCars.slice(0, 20));
    } else {
        console.log("\nAll cars have status 'active'.");
    }
}

checkStatus();
