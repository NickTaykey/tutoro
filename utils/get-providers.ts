import type { BuiltInProviderType } from 'next-auth/providers';
import type { ClientSafeProvider, LiteralUnion } from 'next-auth/react';
import { getProviders } from 'next-auth/react';

type ProvidersList = Record<
  LiteralUnion<BuiltInProviderType, string>,
  ClientSafeProvider
>;

function getProvidersList() {
  return new Promise<ClientSafeProvider[]>(async resolve => {
    try {
      const providers = await getProviders();
      return resolve(Object.values(providers as ProvidersList));
    } catch (e) {
      console.error(e);
      return;
    }
  });
}

export default getProvidersList;
