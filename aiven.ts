const fs = require('fs');
const pg = require('pg');
const url = require('url');

const config = {
    user: "avnadmin",
    password: "AVNS_nfmSGG-cygsQnrCW5Mc",
    host: "register-postgres-register.e.aivencloud.com",
    port: 14004,
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUH52Gxh/oOXbdcRLZLmvAcX8KWjYwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvZWNjOTJmOTUtMTgyZi00MTZkLTk4MDUtNmEwYjMwOWNj
YzcxIFByb2plY3QgQ0EwHhcNMjQxMTIwMTAxODE1WhcNMzQxMTE4MTAxODE1WjA6
MTgwNgYDVQQDDC9lY2M5MmY5NS0xODJmLTQxNmQtOTgwNS02YTBiMzA5Y2NjNzEg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBALSYUfbo
gZej5uirvc1t0xcl4pOBeWI88sbtXLZK6IaQ+b2mdPDzw7Uv8VhPrjZjmy+F7qeo
8eRiYamvDIT/KaZR3D5dlyz359O4cgSoe7VyWiR/YWUdXJFaUPWmd2heuwzoKutv
JsdcFzOlsK5Dv1/Wg+YagtLcYMBmC9yFwuMN8Vm/rIcDGGvfaXEo7rm57pFkHDrd
658odOt3OuwLX+Q1UY1FSVXabFyH/AdBc3tTLBI59FFMc5gcDMf8+bDRgQTGoUWF
TJ8rWE3sMpg8kC+892v+mfk5IFc5qVZ3rFovpZ46cyP837f420Rqytd5QrCsGMAH
1sCbJfndHTcNIgIktMM8VsN+E+JkETESEN20naQHi3Ywi6q5CQss8+MzeLIOe8A0
bWJaCymfS2c3gbdILoEvduNNKIcL4qaLgjC4TsYPQbwfn6Q9ZFlZW0uUmBYR3zVh
qRTppwz/te30cr8w+TC04xzRn/cJ/J9VeH/N8SW0/0IpIl/U3T9mryQysQIDAQAB
oz8wPTAdBgNVHQ4EFgQUdBWHOWzesDD1CdcXeEGh7jtvaFkwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAIXUEahyq02BGQtb
rsqnBB77MD0pdbYGfLsLtuJw25klBtiAf9EywDT0LGczKDuJekbYH4pG5UCBAGPe
fEUuSbGkkcXajnEH0yWT7cFZSrBLD3f7WFxbgvzr3w5m0IWh7tUgqj+vtNBGFyjq
WInYgbUvYYUC5VLlB3fnAHwjXjPBBQ9VDQksAzZMAA1/4jjL38f3SY3vyY/5K4z8
JzXcXtm0AG1/ZKgucX5VtdqizDBPuhuv93FA9tGpLbTRIIBwEyBYJtlByYXRw4wp
bj972OzVpMvnrYbJE+iOfE8eX1/XwlaIKKEi6jP3IH0ht8o4tueoMxKtZiiAeDcu
9unqbqYEhXzM8IDBjIssIIzBRJD8C/YmTzFN1FTx7hauRLN07Lw+qsAgIjCbmznT
YtGWop3RIW+rvTeavsiCnzLdfoT95MPfMVOrSl08lOtMk/cZJPPgfqdoKZ3ttb71
WGC54Cqvo4vtaXsuQFAw1DwX7R7e691loWtuGiy5QtvJqe0IVQ==
-----END CERTIFICATE-----`,
    },
};

const client = new pg.Client(config);
client.connect(function (err) {
    if (err)
        throw err;
    client.query("SELECT VERSION()", [], function (err, result) {
        if (err)
            throw err;

        console.log(result.rows[0].version);
        client.end(function (err) {
            if (err)
                throw err;
        });
    });
});