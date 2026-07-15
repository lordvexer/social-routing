import fs from "fs/promises";
import axios from "axios";


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


const OUTPUT_FILE = "./social.json";



const http = axios.create({

    timeout: 30000,

    headers: {

        "User-Agent":
        "social-routing-updater/1.0"

    }

});



async function getASNPrefixes(asn) {


    const url =
    `https://stat.ripe.net/data/announced-prefixes/data.json?resource=AS${asn}`;



    const response =
    await http.get(url);



    const prefixes =
    response.data?.data?.prefixes;



    if (!Array.isArray(prefixes)) {

        return [];

    }



    return prefixes

        .map(
            item => item.prefix
        )

        .filter(
            prefix =>
            typeof prefix === "string" &&
            prefix.includes(".")
        );

}




function cleanPrefixes(prefixes) {


    return [

        ...new Set(prefixes)

    ];

}




async function main() {


    console.log(
        "Starting social prefix update..."
    );


    const output = {};



    for (
        const [name, config]
        of Object.entries(SERVICES)
    ) {


        console.log(
            `Updating ${name} AS${config.asn}`
        );



        try {


            const prefixes =
            await getASNPrefixes(
                config.asn
            );



            output[name] =
            cleanPrefixes(prefixes);



            console.log(

                `${name}: ${output[name].length} IPv4 prefixes`

            );


        }

        catch(error) {


            console.error(

                `${name} failed:`,
                error.message

            );


            output[name] = [];

        }


    }



    await fs.writeFile(

        OUTPUT_FILE,

        JSON.stringify(

            output,

            null,

            2

        ),

        "utf8"

    );



    console.log(
        "social.json generated successfully"
    );


}



main()
.catch(

    error => {

        console.error(
            "Fatal error:",
            error
        );


        process.exit(1);

    }

);