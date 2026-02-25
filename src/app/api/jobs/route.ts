import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache
let cachedData: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "software engineer";
    const page = searchParams.get("page") || "1";
    const datePosted = searchParams.get("date_posted") || "";
    const remoteOnly = searchParams.get("remote_only") || "";
    const employmentType = searchParams.get("employment_type") || "";
    const jobRequirements = searchParams.get("job_requirements") || "";
    const location = searchParams.get("location") || "";

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "RAPIDAPI_KEY not configured." },
            { status: 500 }
        );
    }

    // Build cache key
    const cacheKey = `${query}_${page}_${datePosted}_${remoteOnly}_${employmentType}_${jobRequirements}_${location}`;

    // Return cached if fresh
    if (cachedData[cacheKey] && Date.now() - cachedData[cacheKey].timestamp < CACHE_TTL) {
        return NextResponse.json(cachedData[cacheKey].data);
    }

    // Build JSearch API URL
    const finalQuery = location ? `${query} in ${location}` : query;
    const params = new URLSearchParams({
        query: finalQuery,
        page,
        num_pages: "1",
    });
    if (datePosted) params.set("date_posted", datePosted);
    if (remoteOnly === "true") params.set("remote_jobs_only", "true");
    if (employmentType) params.set("employment_types", employmentType);
    if (jobRequirements) params.set("job_requirements", jobRequirements);

    const url = `https://jsearch.p.rapidapi.com/search?${params.toString()}`;

    try {
        const res = await fetch(url, {
            headers: {
                "x-rapidapi-host": "jsearch.p.rapidapi.com",
                "x-rapidapi-key": apiKey,
            },
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("JSearch API error:", res.status, errText);
            return NextResponse.json(
                { error: `JSearch API error: ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();

        // Cache the response
        cachedData[cacheKey] = { data, timestamp: Date.now() };

        return NextResponse.json(data);
    } catch (error) {
        console.error("JSearch API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}
