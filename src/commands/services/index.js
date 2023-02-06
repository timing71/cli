import { SERVICE_PROVIDERS } from '@timing71/common';

export const servicesCommand = () => {
  console.log(SERVICE_PROVIDERS.map(s => s.name));
}
