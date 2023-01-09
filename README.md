# New Generators

New Generators is a JavaScript generator library.  

## How To Use

```javascript
const G = NewGenerators();
```

## Functions

|function|description|
|:---|:---|
|of|create a generator which consists of argument|
|ofInfinite|create a infinite generator|
|range|create a generator which enumerates an integer|
|concat|concat generators|
|generate|create a generator from supplier function|
|iterate|create a generator from seed value and function|
|interleave|interleaves generators; infinite generator is supported|
|outerProduct|create outer product of generators|
|powerGenerator|create a generator of power set|
|map|apply a function to each value of generators|
|filter|filters values of generator|
|flatMap|apply a function and flats values|
|forEach|apply a function each value of generator; this function returns no values|
|fold|accumlates values of generator|
|scan|accumlate and create a generator|
|toArray|convert generator to an array|
|limit|limits the generator|
|elementAt|gets a value at an index|
|count|counts size of generator|
|all|tests all elements passes the function|
|any|tests at least one element passes the function|
|skip|skip elements of generator|

## Example

A generator of prime numbers.

```javascript
const G = NewGenerators();

function* prime(g) {
    const first = g.next().value;

    yield first;
    yield* prime(G.filter(g, x => x % first !== 0));
}
const p = prime(G.range(2));

// output [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ]
console.log(G.toArray(G.limit(p, 10)));
```

