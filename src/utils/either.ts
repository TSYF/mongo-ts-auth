export type Either<E, A> = Left<E> | Right<A>;

export interface Left<E> {
    readonly _tag: "Left";
    readonly left: E;
}

export interface Right<A> {
    readonly _tag: "Right";
    readonly right: A;
}

export const left = <E, A=never>(error: E): Either<E, A> => ({ _tag: "Left", left: error })
export const right = <A, E=never>(value: A): Either<E, A> => ({ _tag: "Right", right: value })

export const isLeft = <E, A>(x: Either<E, A>): x is Left<E> => x._tag === "Left";

export type Match = <E, A, B>(onLeft: (e: E) => B, onRight: (a: A) => B)
    => (x: Either<E, A>) => B;
export const match: Match = (onLeft, onRight) =>
    x => isLeft(x) ? onLeft(x.left) : onRight(x.right);

export type MapEither = <E, A, B>(f: (e: A) => B) => (x: Either<E, A>) => Either<E, B>
export const map_either: MapEither = f => match(
    (l) => left(l),
    (r) => right(f(r))
)