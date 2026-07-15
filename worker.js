export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    const service = url.pathname
      .replace("/", "")
      .replace(".txt", "");


    const allowed = [
      "meta",
      "telegram",
      "google",
      "x",
      "bytedance"
    ];


    if (!allowed.includes(service)) {

      return new Response(
        "Service not found",
        {
          status: 404
        }
      );

    }


    const response = await fetch(
      env.GITHUB_JSON_URL
    );


    if (!response.ok) {

      return new Response(
        "GitHub unavailable",
        {
          status: 502
        }
      );

    }


    const data = await response.json();


    if (!data[service]) {

      return new Response(
        "No data",
        {
          status: 404
        }
      );

    }


    let output = "";


    const prefixes = [
      ...new Set(data[service])
    ].sort();



    for (const cidr of prefixes) {

      output += cidr + "|" + service + "\n";

    }



    return new Response(
      output,
      {
        headers:{
          "content-type":
          "text/plain; charset=utf-8",

          "cache-control":
          "public,max-age=21600"
        }
      }
    );


  }
};