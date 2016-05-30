declare var lodash.repeat: _.LoDashStatic;

declar module lodash.repeat {
		interface LoDashStatic {
            repeat(
                string?: string,
                n?: number
            ): string;
		}
		interface LoDashImplicitWrapper<T> {
            repeat(n?: number): string;
		}
		interface LoDashExplicitWrapper<T> {
            repeat(n?: number): LoDashExplicitWrapper<string>;
    }
}
