import axios from "axios";
import URLs from "~~/../hardhat/sources/urls.json";
import latest from "~~/../hardhat/sources/latest.json";

export async function getUserData(source: string, token: string) { // @ts-ignore
    const version = latest[source];
    const result = await axios.get( // @ts-ignore
        URLs[source + "@" + version],
        { headers: { Authorization: "Bearer " + token } }
    );
    return {
        data: result.data.data,
        version
    };
}
