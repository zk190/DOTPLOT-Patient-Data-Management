declare module "bcryptjs" {
  export function compareSync(value: string, hash: string): boolean;
  export function hashSync(value: string, salt: number): string;
}
