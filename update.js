// update.js
import fs from "fs/promises";
import axios from "axios";

const SERVICES = {
  meta: {
    asns: [32934]
  },

  instagram: {
    asns: [32934]
  },

  telegram: {
    asns: [62041]
  },

  google: {
    asns: [15169]
  },

  twitter: {
    asns: [13414]
  },

  bytedance: {
    asns: [396986]
  },

  perplexity: {
    asns: [13335]
  },

  notion: {
    asns: [33191]
  }
};

const OUTPUT_FILE = "./social.json";

const http = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent": "social-routing-updater/3.0"
  }
});

async function getASNPrefixes(asn) {
  const url =
    "https://stat.ripe.net/data/announced-prefixes/data.json" +
    `?resource=AS${asn}&min_peers_seeing=1`;

  const response = await http.get(url);
  const prefixes = response.data?.data?.prefixes;

  if (!Array.isArray(prefixes)) {
    return [];
  }

  return prefixes
    .map(item => item?.prefix)
    .filter(prefix => typeof prefix === "string");
}

function splitPrefixes(prefixes) {
  const ipv4 = new Set();
  const ipv6 = new Set();

  for (const prefix of prefixes) {
    if (prefix.includes(".")) {
      ipv4.add(prefix);
    } else if (prefix.includes(":")) {
      ipv6.add(prefix);
    }
  }

  return {
    ipv4: [...ipv4].sort(),
    ipv6: [...ipv6].sort()
  };
}

async function getServicePrefixes(asns) {
  const results = await Promise.allSettled(
    asns.map(asn => getASNPrefixes(asn))
  );

  const prefixes = [];

  for (const [index, result] of results.entries()) {
    const asn = asns[index];

    if (result.status === "fulfilled") {
      prefixes.push(...result.value);
      continue;
    }

    console.error(
      `AS${asn} failed: ${result.reason?.message ?? "Unknown error"}`
    );
  }

  return splitPrefixes(prefixes);
}

async function main() {
  console.log("Starting dual-stack social prefix update...");

  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source: "RIPEstat announced-prefixes",
      format: "dual-stack-v1"
    }
  };

  for (const [name, config] of Object.entries(SERVICES)) {
    console.log(
      `Updating ${name}: ${config.asns.map(asn => `AS${asn}`).join(", ")}`
    );

    const prefixes = await getServicePrefixes(config.asns);

    output[name] = {
      asns: config.asns,
      ipv4: prefixes.ipv4,
      ipv6: prefixes.ipv6
    };

    console.log(
      `${name}: ${prefixes.ipv4.length} IPv4, ` +
      `${prefixes.ipv6.length} IPv6 prefixes`
    );
  }

  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(output, null, 2),
    "utf8"
  );

  console.log("social.json generated successfully");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});