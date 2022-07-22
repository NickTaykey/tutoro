function ApiHelper(
  url: string,
  data: FormData | unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  stringifyBody: boolean = true
) {
  let body: FormData | string | null = null;
  if (method === 'PUT' || method === 'POST') {
    body = stringifyBody ? JSON.stringify(data) : (data as FormData);
  }
  return fetch(
    `${url}/${
      method === 'GET' ? '?' + new URLSearchParams(JSON.stringify(data)) : ''
    }`,
    {
      method,
      body,
      headers: stringifyBody
        ? {
            'Content-Type': 'application/json',
          }
        : {},
    }
  )
    .then(res => res.json())
    .then(result => {
      console.log(result); // Only for development porpose
      return result;
    })
    .catch(e => e);
}

export default ApiHelper;
