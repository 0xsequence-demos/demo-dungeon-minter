export default function capitalizeFirstLetter(str: string) {
  return str && str.charAt(0).toUpperCase() + str.slice(1);
}
