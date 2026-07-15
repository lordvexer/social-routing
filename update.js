import fs from "fs/promises";
import axios from "axios";
import ipaddr from "ipaddr.js";


const SERVICES = {

    meta: {
        asn: 32934
    },

    telegram: {
        asn: 62041
    },

    google: {
        asn: 15169
    },

    twitter: {
        asn: 13414
    },

    bytedance: {
        asn: 396986
    }

};



const OUTPUT = "./social.json";



async function getPrefixes(asn) {

    const url =
    `https://api.bgpview.io/asn/${asn}/prefixes`;


    const response =
    await axios.get(url,{
        timeout:15000,
        headers:{
            "User-Agent":
            "social-routing-updater"
        }
    });


    if(
        !response.data ||
        !response.data.data ||
        !response.data.data.ipv4_prefixes
    ){

        return [];

    }


    return response
    .data
    .data
    .ipv4_prefixes
    .map(
        x => x.prefix
    );

}




function validCIDR(cidr){


    try {

        const parts =
        cidr.split("/");


        const ip =
        ipaddr.parse(parts[0]);


        return (
            ip.kind() === "ipv4" &&
            Number(parts[1]) >= 0 &&
            Number(parts[1]) <= 32
        );


    }
    catch(e){

        return false;

    }

}





async function build(){


    const output={};


    for(
        const [name,service]
        of Object.entries(SERVICES)
    ){


        console.log(
            `Updating ${name}`
        );


        let prefixes=[];


        try {


            prefixes =
            await getPrefixes(
                service.asn
            );


        }
        catch(error){


            console.error(
                `Failed ${name}`,
                error.message
            );


            continue;

        }



        prefixes =
        prefixes
        .filter(validCIDR);



        prefixes =
        [...new Set(prefixes)];



        output[name]=prefixes;


        console.log(
            `${name}: ${prefixes.length} prefixes`
        );


    }



    await fs.writeFile(

        OUTPUT,

        JSON.stringify(
            output,
            null,
            2
        ),

        "utf8"

    );



    console.log(
        "social.json updated"
    );


}



build()
.catch(
    err=>{
        console.error(err);
        process.exit(1);
    }
);