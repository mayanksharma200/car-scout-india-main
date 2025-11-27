import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase Config:");
console.log("URL:", supabaseUrl);
console.log("Key Length:", supabaseKey ? supabaseKey.length : 0);
console.log("Using Service Key:", !!process.env.SUPABASE_SERVICE_KEY);

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkNews() {
    console.log("Fetching news articles...");
    const { data, error } = await supabase
        .from("news_articles")
        .select("*");

    if (error) {
        console.error("Error fetching news:", error);
    } else {
        console.log(`Found ${data.length} articles.`);
        data.forEach(article => {
            console.log(`- ${article.title} (${article.status})`);
        });
    }
}

checkNews();
