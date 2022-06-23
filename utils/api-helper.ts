function ApiHelper(
  url: string,
  data: any = {},
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
) {
  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(result => result)
    .catch(e => e);
}

export default ApiHelper;
