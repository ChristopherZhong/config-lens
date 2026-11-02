export interface Algorithm {
  id: string;
  name: string;
  encode: (input: string) => string;
  decode: (input: string) => string;
}
