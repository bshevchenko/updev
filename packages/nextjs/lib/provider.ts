import axios from "axios";
import URLs from "../../hardhat/sources/urls.json"; // TODO how about Graph QL requests?

export async function getUserData(source: string, token: string) {
    const result = await axios.get(
        URLs[source],
        { headers: { Authorization: "Bearer " + token } }
    );
    return result.data.data;
}
