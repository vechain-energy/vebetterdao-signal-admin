export const transformIpfsUrl = (url: string): string => {
  return url.startsWith('ipfs://')
    ? `https://api.gateway-proxy.vechain.org/ipfs/${url.slice(7)}`
    : url;
};
