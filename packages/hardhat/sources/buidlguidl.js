// TODO refactor
// addSource(
// 	"buidlguidl",
// 	"const apiResponse = await Functions.makeHttpRequest({"
// 	"  url: 'https://buidlguidl-v3.appspot.com/builders/' + args[1],"
// 	"});"
// 	"if (apiResponse.error) {"
// 	"  throw Error('Request failed');"
// 	"}"
// 	"const { data } = apiResponse;"
// 	"if (!data['status'] || !data.status.text.toLowerCase().includes(args[0].toLowerCase())) {"
// 	"  throw Error('Not Owned');"
// 	"}"
// 	"const created = Math.floor(data.creationTimestamp / 86400000);"
// 	"const roles = { builder: 1 };"
// 	"const functions = { cadets: 1 };"
// 	"const uint32 = v => v.toString(16).padStart(64, '0');"
// 	"const hex = uint32(created) + uint32(data.builds.length) + uint32(roles[data.role] || 0) + uint32(functions[data.function] || 0);"
// 	"return Uint8Array.from(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));",
// 	true
// );