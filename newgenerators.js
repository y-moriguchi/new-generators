/*
 * This source code is under the Unlicense
 */
function NewGenerators() {
    const undef = void 0;
    const me = {
        of: function*(...args) {
            for(let i = 0; i < args.length; i++) {
                yield args[i];
            }
        },

        ofInfinite: function*(...args) {
            let i = 0;

            if(args.length === 0) {
                throw new Error("no arguments");
            } else {
                while(true) {
                    yield args[i];
                    i = (i + 1) % args.length;
                }
            }
        },

        range: function*(start, end, step) {
            const step1 = step === undef ? 1 : step;

            if(step1 > 0) {
                if(end !== undef && end !== null && start > end) {
                    throw new Error("start is bigger than end");
                }

                for(let i = start; end === undef || end === null || i <= end; i += step1) {
                    yield i;
                }
            } else if(step1 < 0) {
                if(end !== undef && end !== null && start < end) {
                    throw new Error("start is smaller than end");
                }

                for(let i = start; end === undef || end === null || i >= end; i += step1) {
                    yield i;
                }
            } else {
                throw new Error("step must not be 0");
            }
        },

        concat: function*(...generators) {
            for(let i = 0; i < generators.length; i++) {
                yield* generators[i];
            }
        },

        generate: function*(supplier) {
            while(true) {
                yield supplier();
            }
        },

        iterate: function*(seed, f) {
            let result = seed;

            while(true) {
                yield result;
                result = f(result);
            }
        },

        interleave: function*(...generators) {
            const done = [];

            for(let i = 0; i < generators.length; i++) {
                done[i] = false;
            }

            while(!done.reduce((p, c) => p && c)) {
                for(let i = 0; i < generators.length; i++) {
                    const value = generators[i].next();

                    if(done[i]) {
                        continue;
                    } else if(value.value !== undef) {
                        yield value.value;
                    } else if(value.done) {
                        done[i] = true;
                    }
                }
            }
        },

        letrec: function(...args) {
            const delays = [];
            const memo = [];

            for(let i = 0; i < args.length; i++) {
                (function(i) {
                    delays.push(function(...dargs) {
                        if(!memo[i]) {
                            memo[i] = args[i].apply(null, delays);
                        }
                        return memo[i].apply(null, dargs);
                    });
                })(i);
            }
            return delays[0];
        },

        powerGenerator: function*(list, n, cutFunction) {
            function* inner(n, list0) {
                for(let i = 0; i < list.length; i++) {
                    const list2 = list0.concat([list[i]]);

                    if(cutFunction(list2)) {
                        if(n > 1) {
                            yield* inner(n - 1, list2);
                        } else {
                            yield list2;
                        }
                    }
                }
            }

            if(n <= 0 || Math.floor(n) !== n) {
                throw new Error("Invalid argument: " + n);
            } else if(!cutFunction) {
                yield* me.powerGenerator(list, n, x => true);
            } else {
                yield* inner(n, []);
            }
        },

        map: function*(f, ...generators) {
            function getall() {
                const result = [];

                for(let i = 0; i < generators.length; i++) {
                    const value = generators[i].next();

                    if(!value.done || value.value !== undef) {
                        result.push(value.value);
                    } else {
                        return false;
                    }
                }
                return result;
            }

            let values;

            while(!!(values = getall())) {
                yield f.apply(null, values);
            }
        },

        filter: function*(generator, pred) {
            let value;

            while(!(value = generator.next()).done) {
                if(pred(value.value)) {
                    yield value.value;
                }
            }

            if(value.value !== undef && pred(value.value)) {
                return value.value;
            }
        },

        flatMap: function*(generator, f) {
            let value;

            while(!(value = generator.next()).done) {
                yield* f(value.value);
            }

            if(value.value !== undef) {
                yield* f(value.value);
            }
        },

        forEach: function(generator, action) {
            let value;

            while(!(value = generator.next()).done) {
                action(value.value);
            }

            if(value.value !== undef) {
                action(value.value);
            }
        },

        fold: function(generator, init, f) {
            let value, result = init;

            while(!(value = generator.next()).done) {
                result = f(result, value.value);
            }

            if(value.value !== undef) {
                result = f(result, value.value);
            }
            return result;
        },

        scan: function*(generator, init, f) {
            let value, result = init;

            while(!(value = generator.next()).done) {
                result = f(result, value.value);
                yield result;
            }

            if(value.value !== undef) {
                yield f(result, value.value);
            }
        },

        toArray: function(generator) {
            let value, result = [];

            while(!(value = generator.next()).done) {
                result.push(value.value);
            }

            if(value.value !== undef) {
                result.push(value.value);
            }
            return result;
        },

        limit: function*(generator, maxSize) {
            let value, i = 0;

            for(; i < maxSize && !(value = generator.next()).done; i++) {
                yield value.value;
            }

            if(value.value !== undef && i < maxSize) {
                return value.value;
            }
        },

        elementAt: function(generator, index) {
            let value, i = 0;

            if(index < 0) {
                throw new Error("index must be non-negative");
            }
            for(; i < index && !(value = generator.next()).done; i++) { }
            return !value.done || (value.value !== undef && i + 1 === index) ? value.value : undef;
        },

        count: function(generator) {
            let result = 0;

            for(; !(value = generator.next()).done; result++) { }
            return value.value === undef ? result : result + 1;
        },

        all: function(generator, pred) {
            let value;

            while(!(value = generator.next()).done) {
                if(!pred(value.value)) {
                    return false;
                }
            }
            return value.value === undef || pred(value.value);
        },

        any: function(generator, pred) {
            let value;

            while(!(value = generator.next()).done) {
                if(pred(value.value)) {
                    return true;
                }
            }
            return value.value !== undef && pred(value.value);
        },

        skip: function*(generator, n) {
            let value;

            if(n < 1) {
                throw new Error("index must be positive");
            }
            for(let i = 0; i < n && !(value = generator.next()).done; i++) { }
            if(!value.done) {
                yield* generator;
            }
        }
    };
    return me;
}

