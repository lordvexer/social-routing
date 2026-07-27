// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const path = url.pathname
      .replace(/^\/+/, "")
      .replace(/\.txt$/, "");

    const isIPv6 = path.endsWith("-v6");

    const service = isIPv6
      ? path.slice(0, -3)
      : path;

    const allowed = [
      "meta",
      "instagram",
      "telegram",
      "google",
      "twitter",
      "bytedance",
      "perplexity",
      "notion"
    ];

    if (!allowed.includes(service)) {
      return new Response("Service not found", {
        status: 404
      });
    }

    const githubResponse = await fetch(env.GITHUB_JSON_URL, {
      cf: {
        cacheTtl: 300,
        cacheEverything: true
      }
    });

    if (!githubResponse.ok) {
      return new Response("GitHub unavailable", {
        status: 502
      });
    }

    const data = await githubResponse.json();
    const family = isIPv6 ? "ipv6" : "ipv4";
    const prefixes = data?.[service]?.[family];

    if (!Array.isArray(prefixes)) {
      return new Response("No data", {
        status: 404
      });
    }

    const listName = isIPv6
      ? `${service}-ipv6`
      : `${service}-ipv4`;

    const output = [...new Set(prefixes)]
      .sort()
      .map(prefix => `${prefix}|${listName}`)
      .join("\n") + "\n";

    return new Response(output, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300"
      }
    });
  }
};