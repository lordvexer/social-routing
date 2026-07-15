export default {

async fetch(request, env, ctx) {


const source = env.GITHUB_JSON_URL;


const response =
await fetch(source);


if(!response.ok){

return new Response(
"GitHub unavailable",
{
status:502
}
);

}



const data =
await response.json();



let output = "";



for(
const service in data
){


for(
const cidr of data[service]
){


output += cidr + "|" + service + "\n";


}


}



return new Response(

output,

{

headers:{

"content-type":
"text/plain",

"cache-control":
"public,max-age=21600"

}

}

);


}

};