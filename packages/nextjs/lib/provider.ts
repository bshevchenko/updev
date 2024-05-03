import axios from "axios";
import URLs from "../../hardhat/sources/urls.json";

export async function getUserData(source: string, token: string) {
    const result = await axios.get( // @ts-ignore
        URLs[source],
        { headers: { Authorization: "Bearer " + token } }
    );
    // TODO data filter for every source? like to remove links from GitHub API response
    const data = result.data.data || result.data; // TODO set data path in source configs?
    return {
        data
    };
}
