import { Types } from 'ably';

import { configureAbly } from '@ably-labs/react-hooks';

const prefix = process.env.NEXT_PUBLIC_API_ROOT || '';

const clientId =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

const sdk: Types.RealtimePromise = configureAbly({
  authUrl: `${prefix}/api/createTokenRequest?clientId=${clientId}`,
  clientId: clientId,
});

export default sdk;
