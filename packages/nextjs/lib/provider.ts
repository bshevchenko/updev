import axios from "axios";
import URLs from "../../hardhat/sources/urls.json";

export async function getUserData(source: string, token: string, id?: string) {
    // @ts-ignore
    let url = URLs[source].replace("{id}", id);
    const result = await axios.get(
        url,
        token ? { headers: { Authorization: "Bearer " + token } } : {}
    );
    // TODO data filter for every source? like to remove links from GitHub API response
    const data = result.data.data || result.data; // TODO set data path in source configs?
    return {
        data
    };
}
