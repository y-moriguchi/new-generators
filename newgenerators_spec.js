/*
 * This source code is under the Unlicense
 */
/*
 * This test case is described for Jasmine.
 */
describe("NewGenerators", function() {
    const G = NewGenerators();
    const undef = void 0;

    function _(x) {
        console.log(x);
        return x;
    }

    function testGeneratorPart(g, ...expectData) {
        for(let i = 0; i < expectData.length; i++) {
            expect(g.next().value).toEqual(expectData[i]);
        }
    }

    function testGenerator(g, ...expectData) {
        testGeneratorPart.apply(null, [g].concat(expectData));
        expect(g.next().done).toBeTruthy();
    }

    function* ofReturn(...args) {
        if(args.length > 0) {
            for(let i = 0; i < args.length - 1; i++) {
                yield args[i];
            }
            return args[args.length - 1];
        }
    }

    function testGeneratorReturn(g, ...expectData) {
        for(let i = 0; i < expectData.length - 1; i++) {
            expect(g.next().value).toEqual(expectData[i]);
        }
        expect(g.next().value).toBe(expectData[expectData.length - 1]);
        expect(g.next().done).toBeTruthy();
    }

    beforeEach(function() {
    });

    describe("testing generators", function() {
        it("of", function() {
            testGenerator(G.of(7, 6, 5), 7, 6, 5);
            testGenerator(G.of());
        });

        it("ofInfinite", function() {
            testGeneratorPart(G.ofInfinite(7, 6, 5), 7, 6, 5, 7, 6, 5);
            testGeneratorPart(G.ofInfinite(7), 7, 7, 7);
            expect(() => G.ofInfinite().next()).toThrow();
        });

        it("range", function() {
            testGenerator(G.range(2, 7, 2), 2, 4, 6);
            testGenerator(G.range(2, 2, 2), 2);
            testGenerator(G.range(7, 5, -1), 7, 6, 5);
            testGenerator(G.range(7, 7, -1), 7);
            testGenerator(G.range(2, 7), 2, 3, 4, 5, 6, 7);
            testGenerator(G.range(2, 7), 2, 3, 4, 5, 6, 7);
            testGeneratorPart(G.range(2, null, 2), 2, 4, 6, 8, 10);
            testGeneratorPart(G.range(2), 2, 3, 4, 5, 6, 7, 8);
            expect(() => G.range(2, 1, 1).next()).toThrow();
            expect(() => G.range(1, 2, -1).next()).toThrow();
            expect(() => G.range(1, 2, 0).next()).toThrow();
        });

        it("concat", function() {
            testGenerator(G.concat(G.of(2, 3), G.of(4, 5), G.of(6, 7)), 2, 3, 4, 5, 6, 7);
            testGenerator(G.concat(G.of(2, 3)), 2, 3);
            testGenerator(G.concat());
        });

        it("generate", function() {
            function test1() {
                let i = 1;
                return () => i++;
            }
            testGeneratorPart(G.generate(test1()), 1, 2, 3, 4, 5, 6, 7);
        });

        it("iterate", function() {
            testGeneratorPart(G.iterate(1, x => x * 2), 1, 2, 4, 8, 16, 32);
        });

        it("interleave", function() {
            testGenerator(G.interleave(G.of(1, 2, 3), G.of(4, 5, 6), G.of(7, 8, 9)), 1, 4, 7, 2, 5, 8, 3, 6, 9);
            testGenerator(G.interleave(G.of(1, 2, 3), G.of(4, 5, 6), G.of(7, 8)), 1, 4, 7, 2, 5, 8, 3, 6);
            testGenerator(G.interleave(G.of(1), G.of(4, 5), G.of(7, 8, 9)), 1, 4, 7, 5, 8, 9);
            testGenerator(G.interleave(G.of(1, undef, 3), G.of(4, 5), G.of(7, 8, 9)), 1, 4, 7, 5, 8, 3, 9);
            testGenerator(G.interleave(G.of(1, 2, 3), G.of(), G.of(4, 5)), 1, 4, 2, 5, 3);
            testGenerator(G.interleave(G.of(1, 2, 3)), 1, 2, 3);
            testGenerator(G.interleave(G.of()));
        });

        it("letrec", function() {
            function* integrate(g) {
                for(let d = 1; true; d++) {
                    yield g.next().value / d;
                }
            }

            const exp = G.letrec(function(y) {
                return function*() {
                    yield 1;
                    yield* integrate(y());
                }
            })();

            const cn = G.letrec(function(c, s) {
                return function*() {
                    yield 1;
                    yield* integrate(s());
                }
            }, function(c, s) {
                return function*() {
                    yield 0;
                    yield* G.map(x => -x, integrate(c()));
                }
            })();

            expect(Math.abs(G.toArray(G.limit(exp, 20)).reduce((accum, current) => accum + current) - Math.E) < 1e-10).toBeTruthy();
            expect(Math.abs(G.toArray(G.limit(cn, 20)).reduce((accum, current) => accum + current) - Math.cos(1)) < 1e-10).toBeTruthy();
        });

        it("outerProduct", function() {
            testGenerator(G.outerProduct((x, y) => x - y, G.of(7, 6, 5), G.of(3, 4, 6)), 4, 3, 3, 2, 2, 1, 1, 0, -1);
            testGenerator(G.outerProduct((x, y, z) => x + y + z, G.of(7, 6, 5), G.of(3, 4, 6), G.of(2, 7)),
                12, 11, 13, 17, 10, 12, 15, 16, 18, 11, 14, 15, 17, 20, 13, 16, 19, 18);
            testGeneratorPart(G.outerProduct((x, y) => x + y, G.range(2), G.of(2, 7)), 4, 5, 9, 6, 10, 7, 11, 8);
        });

        it("powerGenerator", function() {
            testGenerator(G.powerGenerator([1, 2, 3], 2), [1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3]);
            testGenerator(G.powerGenerator([1, 2], 3), [1, 1, 1], [1, 1, 2], [1, 2, 1], [1, 2, 2], [2, 1, 1], [2, 1, 2], [2, 2, 1], [2, 2, 2]);
            testGenerator(G.powerGenerator([1, 2, 3], 1), [1], [2], [3]);
            testGenerator(G.powerGenerator([1, 2, 3], 2, x => x[1] !== 2), [1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]);
        });

        it("map", function() {
            testGenerator(G.map(x => x * x, G.of(1, 2, 3)), 1, 4, 9);
            testGenerator(G.map((x, y) => x * y, G.of(1, 2, 3), G.of(4, 5)), 4, 10);
            testGenerator(G.map((x, y) => x * y, G.of(1, 2, 3), G.of(4, 5), G.of()));
            testGenerator(G.map(x => x * x, ofReturn(1, 2, 3)), 1, 4, 9);
            testGenerator(G.map((x, y) => x * y, ofReturn(1, 2, 3), G.of(4, 5)), 4, 10);
        });

        it("filter", function() {
            testGenerator(G.filter(G.of(1, 2, 3, 4), x => x % 2 === 0), 2, 4);
            testGeneratorReturn(G.filter(ofReturn(1, 2, 3, 4), x => x % 2 == 0), 2, 4);
            testGenerator(G.filter(ofReturn(1, 2, 3, 4), x => x % 2 == 1), 1, 3);
        });

        it("flatMap", function() {
            testGenerator(G.flatMap(G.of(1, 2, 3), x => G.of(x, x * 2)), 1, 2, 2, 4, 3, 6);
            testGenerator(G.flatMap(G.of(), x => G.of(x, x * 2)));
            testGenerator(G.flatMap(G.of(1, 2, 3), x => x % 2 === 0 ? G.of() : G.of(x, x * 2)), 1, 2, 3, 6);
            testGenerator(G.flatMap(ofReturn(1, 2, 3), x => G.of(x, x * 2)), 1, 2, 2, 4, 3, 6);
        });

        it("forEach", function() {
            let result;
            const action = x => result += x;

            result = "";
            G.forEach(G.of(1, 2, 3), action);
            expect(result).toBe("123");
            result = "";
            G.forEach(G.of(), action);
            expect(result).toBe("");
            result = "";
            G.forEach(ofReturn(1, 2, 3), action);
            expect(result).toBe("123");
        });

        it("fold", function() {
            expect(G.fold(G.of(1, 2, 3), 6, (accum, x) => accum - x)).toBe(0);
            expect(G.fold(G.of(), 6, (accum, x) => accum - x)).toBe(6);
            expect(G.fold(ofReturn(1, 2, 3), 6, (accum, x) => accum - x)).toBe(0);
        });

        it("scan", function() {
            testGenerator(G.scan(G.of(1, 2, 3), 6, (accum, x) => accum - x), 5, 3, 0);
            testGenerator(G.scan(G.of(), 6, (accum, x) => accum - x));
            testGenerator(G.scan(ofReturn(1, 2, 3), 6, (accum, x) => accum - x), 5, 3, 0);
        });

        it("toArray", function() {
            expect(G.toArray(G.of(1, 2, 3))).toEqual([1, 2, 3]);
            expect(G.toArray(G.of())).toEqual([]);
            expect(G.toArray(ofReturn(1, 2, 3))).toEqual([1, 2, 3]);
        });

        it("limit", function() {
            testGenerator(G.limit(G.of(1, 2, 3), 2), 1, 2);
            testGenerator(G.limit(G.of(1, 2, 3), 3), 1, 2, 3);
            testGenerator(G.limit(G.of(1, 2, 3), 4), 1, 2, 3);
            testGenerator(G.limit(G.ofInfinite(1), 3), 1, 1, 1);
            testGenerator(G.limit(ofReturn(1, 2, 3), 2), 1, 2);
            testGeneratorReturn(G.limit(ofReturn(1, 2, 3), 3), 1, 2, 3);
            testGeneratorReturn(G.limit(ofReturn(1, 2, 3), 4), 1, 2, 3);
        });

        it("elementAt", function() {
            expect(G.elementAt(G.of(1, 2, 3), 2)).toBe(2);
            expect(G.elementAt(G.of(1, 2, 3), 3)).toBe(3);
            expect(G.elementAt(G.of(1, 2, 3), 4)).toBe(undef);
            expect(G.elementAt(ofReturn(1, 2, 3), 2)).toBe(2);
            expect(G.elementAt(ofReturn(1, 2, 3), 3)).toBe(3);
            expect(G.elementAt(ofReturn(1, 2, 3), 4)).toBe(undef);
        });

        it("count", function() {
            expect(G.count(G.of(1, 2, 3))).toBe(3);
            expect(G.count(G.of())).toBe(0);
            expect(G.count(ofReturn(1, 2, 3))).toBe(3);
        });

        it("all", function() {
            expect(G.all(G.of(1, 2, 3), x => x < 4)).toBe(true);
            expect(G.all(G.of(1, 2, 3), x => x % 2 === 0)).toBe(false);
            expect(G.all(G.of(), x => false)).toBe(true);
            expect(G.all(ofReturn(1, 2, 3), x => x < 4)).toBe(true);
        });

        it("any", function() {
            expect(G.any(G.of(1, 2, 3), x => x > 4)).toBe(false);
            expect(G.any(G.of(1, 2, 3), x => x % 2 === 0)).toBe(true);
            expect(G.any(G.of(), x => true)).toBe(false);
            expect(G.any(ofReturn(1, 2, 3), x => x > 4)).toBe(false);
        });

        it("skip", function() {
            testGenerator(G.skip(G.of(1, 2, 3, 4), 2), 3, 4);
            testGenerator(G.skip(G.of(1, 2, 3, 4), 3), 4);
            testGenerator(G.skip(G.of(1, 2, 3, 4), 4));
            testGenerator(G.skip(G.of(1, 2, 3, 4), 5));
            testGenerator(G.skip(G.of(), 1));
        });
    });
});

