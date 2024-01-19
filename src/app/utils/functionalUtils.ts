export type ComposableFunction = (...args: any) => any;
function compose(...callbacks: ComposableFunction[]): ComposableFunction {

    if (callbacks.length === 0) {
        return (thing) => thing;
    }
    if (callbacks.length === 1) {

        return callbacks[0];
    }

    return (thing) => 
        callbacks.reduceRight((result, callback) => callback(result), thing);
}

function pipe(...callbacks: Function[]): Function {

    if (callbacks.length === 0) {
        return (thing: unknown) => thing;
    }
    if (callbacks.length === 1) {

        return callbacks[0];
    }

    return (thing: unknown) => 
        callbacks.reduce((result, callback) => {
            return callback(result);
        }, thing);
}

function curry(callback: Function) {
    return function curried(...a: unknown[]) {
        
        return a.length >= callback.length
                ? callback(...a)
                : (...b: unknown[]) => curried(...a, ...b);
    }
}

function flip(fn: Function) {
    return curry((first?: unknown, second?: unknown) => fn(second, first));
}

export { compose, pipe, curry, flip };