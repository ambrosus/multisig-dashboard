export default function formatAddress(str) {
  return `${str.substring(0, 4)}...${str.substring(
    str.length - 4,
    str.length
  )}`;
}
