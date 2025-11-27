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

async function publishAllNews() {
    console.log("Publishing all draft news articles...");

    const { data, error } = await supabase
        .from("news_articles")
        .update({ status: 'published', published_at: new Date() })
        .eq('status', 'draft')
        .select();

    if (error) {
        console.error("Error publishing news:", error);
    } else {
        console.log(`Successfully published ${data.length} articles.`);
        data.forEach(article => {
            console.log(`- Published: ${article.title}`);
        });
    }
}

publishAllNews();
