import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkSlugs() {
    console.log("Fetching news article slugs...");
    const { data, error } = await supabase
        .from("news_articles")
        .select("title, slug, status");

    if (error) {
        console.error("Error fetching news:", error);
    } else {
        console.log(`Found ${data.length} articles.`);
        data.forEach(article => {
            console.log(`- Title: "${article.title}"`);
            console.log(`  Slug:  "${article.slug}"`);
            console.log(`  Status: ${article.status}`);
            console.log('---');
        });
    }
}

checkSlugs();
