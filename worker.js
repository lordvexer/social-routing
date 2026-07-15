export default {
  async fetch(request) {

    const github =
    "https://raw.githubusercontent.com/USERNAME/social-routing/main/social.json";


    const response = await fetch(github);


    if (!response.ok) {

      return new Response(
        "GitHub list unavailable",
        {
          status:500
        }
      );

    }


    const data = await response.json();


    let output = [];


    for (const service in data) {

      for (const cidr of data[service]) {

        output.push({

          address:cidr,

          comment:service

        });

      }

    }


    return new Response(
      JSON.stringify(output),
      {

        headers:{

          "content-type":
          "application/json",

          "cache-control":
          "no-cache"

        }

      }
    );

  }
}