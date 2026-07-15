import axios from "axios";
import dns from "dns";

dns.setServers([
    "10.10.10.1",
    "8.8.8.8",
    "1.1.1.1"
]);


const domains = process.argv.slice(2);


if(domains.length === 0){
    console.log("Usage: node find-asn.js domain.com");
    process.exit(1);
}



async function findASN(domain){


    console.log("\nDomain:", domain);



    const ips = await new Promise((resolve,reject)=>{

        dns.resolve4(
            domain,
            (err,addresses)=>{

                if(err)
                    reject(err);

                else
                    resolve(addresses);

            }
        );

    });



    console.log(
        "IPv4:",
        ips.join(", ")
    );



    for(const ip of ips){


        try {


            const r = await axios.get(

                `https://stat.ripe.net/data/network-info/data.json?resource=${ip}`,

                {
                    timeout:15000
                }

            );


            console.log(
                "IP:",
                ip,
                "ASN:",
                r.data.data.asns
            );


        }

        catch(e){

            console.log(
                "ASN lookup failed:",
                ip,
                e.message
            );

        }

    }

}



for(const d of domains){

    await findASN(d);

}