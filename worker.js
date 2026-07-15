export default {

  async fetch(request, env, ctx) {


    const githubRawURL =
      env.GITHUB_JSON_URL;



    if (!githubRawURL) {

      return new Response(
        JSON.stringify({
          error: "GITHUB_JSON_URL missing"
        }),
        {
          status:500,
          headers:{
            "content-type":"application/json"
          }
        }
      );

    }



    const cache =
      caches.default;



    const cacheKey =
      new Request(
        request.url,
        request
      );



    let cached =
      await cache.match(cacheKey);



    if (cached) {


      return cached;

    }



    const response =
      await fetch(
        githubRawURL,
        {
          headers:{
            "User-Agent":
            "Cloudflare-Worker-Social-Routing"
          }
        }
      );



    if (!response.ok) {


      return new Response(

        JSON.stringify({
          error:
          "GitHub source unavailable"
        }),

        {
          status:502,

          headers:{
            "content-type":
            "application/json"
          }
        }

      );

    }



    const data =
      await response.json();



    const output = [];



    for (
      const service in data
    ) {


      for (
        const cidr of data[service]
      ) {


        output.push({

          address:cidr,

          comment:service

        });


      }


    }



    const result =
      new Response(

        JSON.stringify(
          output
        ),

        {

          headers:{

            "content-type":
            "application/json",

            "cache-control":
            "public, max-age=21600"

          }

        }

      );



    ctx.waitUntil(

      cache.put(
        cacheKey,
        result.clone()
      )

    );



    return result;


  }

};