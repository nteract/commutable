import Buffer = require('buffer');

declare namespace uuid {
    export function v1(options?: any): string;
    export function v1(options: any, buf: Buffer, offset?: number): Buffer;

    export function v4(options?: any): string;
    export function v4(options: any, buf: Buffer, offset?: number): Buffer;

    export function parse(str: string, buf?: Buffer, offset?: number): Buffer;
    export function unparse(buf: Buffer, offset?: number): string;
}

export = uuid;
