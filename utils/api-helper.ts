function ApiHelper(
  url: string,
  data: FormData | unknown,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  includeContentTypeJSON: boolean = true
) {
  let body: FormData | string | null = null;
  if (method === 'PUT' || method === 'POST') {
    body = includeContentTypeJSON ? JSON.stringify(data) : (data as FormData);
  }
  return fetch(
    `${url}/${
      method === 'GET'
        ? '?' + new URLSearchParams(data as Record<string, string>)
        : ''
    }`,
    {
      method,
      body,
      headers: includeContentTypeJSON
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
