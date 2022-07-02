function ApiHelper(
  url: string,
  data: any = {},
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
) {
  const body =
    method === 'PUT' || method === 'POST' ? JSON.stringify(data) : null;
  return fetch(url, {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(result => {
      console.log(result); // Only for development porpose
      return result;
    })
    .catch(e => e);
}

export default ApiHelper;
