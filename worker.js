for (const service in data) {

 if(service !== "meta")
   continue;

 for(const cidr of data[service]) {
   output += cidr + "|" + service + "\n";
 }

}