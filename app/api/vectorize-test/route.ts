import { VectorizeService } from "@/lib/retrieval";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/guardrails";

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request);
    if (limited) return limited;

    const { query, numResults: requested = 2 } = await request.json();
    const numResults = Math.min(Math.max(Number(requested) || 2, 1), 10);

    if (!query) {
      return new Response("Query is required", { status: 400 });
    }

    const vectorize = new VectorizeService();
    const documents = await vectorize.retrieveDocuments(query, numResults);

    // Return full response shape for inspection
    const response = {
      query,
      documentsCount: documents.length,
      documents,
      // Add formatted context and sources for preview
      formattedContext: vectorize.formatDocumentsForContext(documents),
      chatSources: vectorize.convertDocumentsToChatSources(documents),
    };

    return Response.json(response);
  } catch (error) {
    console.error("Vectorize test API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve documents", details: error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
